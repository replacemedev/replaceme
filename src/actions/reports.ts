"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/server/auth/session";
import { requireAdmin } from "@/lib/server/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/server";
import { formatFullName } from "@/lib/format/name";
import { runAction, ok, fail } from "@/lib/server/action-result";
import {
  CacheKeys,
  CACHE_TTL_SECONDS,
  getOrSet,
  cacheDel,
} from "@/lib/server/redis-cache";
import { rateLimitReportSubmission } from "@/lib/server/rate-limit";
import { safeError } from "@/utils/logger";

import { REPORT_CATEGORIES, REPORT_STATUSES } from "@/lib/reporting/constants";
import {
  normalizeReportEvidenceMime,
  validateReportEvidenceFile,
} from "@/lib/reporting/evidence";

const REPORT_EVIDENCE_BUCKET = "report-evidence";

const jsonSizeLimitedSchema = z
  .unknown()
  .default({})
  .refine((value) => {
    try {
      const raw = JSON.stringify(value ?? {});
      return raw.length <= 8_000;
    } catch {
      return false;
    }
  }, "Context payload too large.");

const createReportSchema = z
  .object({
    category: z.enum(REPORT_CATEGORIES),
    title: z.string().trim().max(140).optional(),
    descriptionMarkdown: z.string().trim().min(10).max(10_000),
    reportedUrl: z.union([z.string().url(), z.literal("")]).optional(),
    appArea: z.string().trim().max(80).optional(),
    context: jsonSizeLimitedSchema.optional(),
  })
  .strict();

export type CreateReportInput = z.infer<typeof createReportSchema>;

const adminReportsQuerySchema = z
  .object({
    status: z.enum(REPORT_STATUSES).optional(),
    reporterRole: z.enum(["worker", "employer"]).optional(),
    q: z.string().trim().max(120).optional(),
    limit: z.number().int().min(10).max(100).default(25),
    offset: z.number().int().min(0).default(0),
  })
  .strict();

export type AdminReportsQuery = z.infer<typeof adminReportsQuerySchema>;

function adminReportsCacheKey(query: AdminReportsQuery): string {
  const stable = {
    status: query.status ?? "all",
    reporterRole: query.reporterRole ?? "all",
    q: query.q ?? "",
    limit: query.limit,
    offset: query.offset,
  };
  return CacheKeys.adminReportsList(Buffer.from(JSON.stringify(stable)).toString("base64url"));
}

export async function createReport(input: unknown) {
  return runAction("createReport", async () => {
    const parsed = createReportSchema.safeParse(input);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid report.");
    }

    const ctx = await requireRole(["worker", "employer"]);
    const rate = await rateLimitReportSubmission(ctx.profile.id);
    if (!rate.success) return fail(rate.error);

    const authUserId = ctx.user.id;

    const h = await headers();
    const userAgent = h.get("user-agent");

    const { data: inserted, error } = await ctx.supabase
      .from("reports")
      .insert({
        reporter_id: authUserId,
        reporter_role: ctx.profile.role,
        category: parsed.data.category,
        status: "open",
        title: parsed.data.title?.trim() ? parsed.data.title.trim() : null,
        description_markdown: parsed.data.descriptionMarkdown,
        reported_url: parsed.data.reportedUrl?.trim()
          ? parsed.data.reportedUrl.trim()
          : null,
        user_agent: userAgent,
        app_area: parsed.data.appArea?.trim() ? parsed.data.appArea.trim() : null,
        context: parsed.data.context ?? {},
      })
      .select("id")
      .single();

    if (error || !inserted) {
      safeError("createReport insert:", error);
      return fail("Failed to submit report.");
    }

    // keep admin list fresh
    await cacheDel(CacheKeys.adminReportsList("all"));
    revalidatePath("/admin/reports");
    return ok({ reportId: inserted.id });
  });
}

export async function submitReport(formData: FormData) {
  return runAction("submitReport", async () => {
    const category = formData.get("category");
    const title = formData.get("title");
    const descriptionMarkdown = formData.get("descriptionMarkdown");
    const reportedUrl = formData.get("reportedUrl");
    const appArea = formData.get("appArea");
    const contextRaw = formData.get("context");
    const file = formData.get("file");

    let context: unknown = {};
    if (typeof contextRaw === "string" && contextRaw.trim()) {
      try {
        context = JSON.parse(contextRaw);
      } catch {
        return fail("Invalid report context.");
      }
    }

    const parsed = createReportSchema.safeParse({
      category,
      title: typeof title === "string" ? title : undefined,
      descriptionMarkdown,
      reportedUrl: typeof reportedUrl === "string" ? reportedUrl : undefined,
      appArea: typeof appArea === "string" ? appArea : undefined,
      context,
    });

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid report.");
    }

    const evidenceFile = file instanceof File && file.size > 0 ? file : null;
    const evidenceError = validateReportEvidenceFile(evidenceFile);
    if (evidenceError) return fail(evidenceError);

    const ctx = await requireRole(["worker", "employer"]);
    const rate = await rateLimitReportSubmission(ctx.profile.id);
    if (!rate.success) return fail(rate.error);

    const authUserId = ctx.user.id;

    const h = await headers();
    const userAgent = h.get("user-agent");

    const { data: inserted, error } = await ctx.supabase
      .from("reports")
      .insert({
        reporter_id: authUserId,
        reporter_role: ctx.profile.role,
        category: parsed.data.category,
        status: "open",
        title: parsed.data.title?.trim() ? parsed.data.title.trim() : null,
        description_markdown: parsed.data.descriptionMarkdown,
        reported_url: parsed.data.reportedUrl?.trim()
          ? parsed.data.reportedUrl.trim()
          : null,
        user_agent: userAgent,
        app_area: parsed.data.appArea?.trim() ? parsed.data.appArea.trim() : null,
        context: parsed.data.context ?? {},
      })
      .select("id")
      .single();

    if (error || !inserted) {
      safeError("submitReport insert:", error);
      return fail("Failed to submit report.");
    }

    if (evidenceFile) {
      const mimeType = normalizeReportEvidenceMime(evidenceFile.type);
      if (!mimeType) {
        await ctx.supabase.from("reports").delete().eq("id", inserted.id);
        return fail("Only JPG and PNG files are allowed.");
      }

      const extension =
        mimeType === "image/png"
          ? "png"
          : evidenceFile.name.toLowerCase().endsWith(".jpg") ||
              evidenceFile.name.toLowerCase().endsWith(".jpeg")
            ? "jpg"
            : "jpeg";
      const storagePath = `${authUserId}/${inserted.id}.${extension}`;
      const fileBuffer = await evidenceFile.arrayBuffer();

      const { error: uploadError } = await ctx.supabase.storage
        .from(REPORT_EVIDENCE_BUCKET)
        .upload(storagePath, fileBuffer, {
          contentType: mimeType,
          upsert: false,
        });

      if (uploadError) {
        safeError("submitReport evidence upload:", uploadError);
        await ctx.supabase.from("reports").delete().eq("id", inserted.id);
        return fail("Failed to upload screenshot evidence.");
      }

      const { data: evidenceRow, error: evidenceUpdateError } = await ctx.supabase
        .from("reports")
        .update({
          evidence_storage_path: storagePath,
          evidence_mime_type: mimeType,
          evidence_file_size_bytes: evidenceFile.size,
        })
        .eq("id", inserted.id)
        .eq("reporter_id", authUserId)
        .select("id, evidence_storage_path")
        .maybeSingle();

      if (evidenceUpdateError || !evidenceRow?.evidence_storage_path) {
        safeError("submitReport evidence update:", evidenceUpdateError);
        await ctx.supabase.storage.from(REPORT_EVIDENCE_BUCKET).remove([storagePath]);
        await ctx.supabase.from("reports").delete().eq("id", inserted.id);
        return fail("Failed to attach screenshot evidence.");
      }
    }

    await cacheDel(CacheKeys.adminReportsList("all"));
    revalidatePath("/admin/reports");
    return ok({ reportId: inserted.id });
  });
}

export type AdminReportRow = {
  id: string;
  createdAt: string;
  status: (typeof REPORT_STATUSES)[number];
  category: (typeof REPORT_CATEGORIES)[number];
  reporterId: string;
  reporterRole: "worker" | "employer" | "admin";
  title: string | null;
  reportedUrl: string | null;
  hasEvidence: boolean;
};

async function resolveReportEvidencePath(
  adminSupabase: Awaited<ReturnType<typeof createAdminClient>>,
  reporterId: string,
  reportId: string,
  existingPath: string | null
): Promise<string | null> {
  if (existingPath) return existingPath;

  const { data: objects, error } = await adminSupabase.storage
    .from(REPORT_EVIDENCE_BUCKET)
    .list(reporterId, { limit: 20 });

  if (error || !objects?.length) return null;

  const match = objects.find(
    (obj) =>
      obj.name === `${reportId}.png` ||
      obj.name === `${reportId}.jpg` ||
      obj.name === `${reportId}.jpeg` ||
      obj.name.startsWith(`${reportId}.`)
  );

  return match ? `${reporterId}/${match.name}` : null;
}

async function signReportEvidenceUrl(
  adminSupabase: Awaited<ReturnType<typeof createAdminClient>>,
  storagePath: string
): Promise<string | null> {
  const { data: signed, error: signedError } = await adminSupabase.storage
    .from(REPORT_EVIDENCE_BUCKET)
    .createSignedUrl(storagePath, 60 * 60);

  if (signedError) {
    safeError("signReportEvidenceUrl:", signedError);
    return null;
  }

  return signed?.signedUrl ?? null;
}

export async function getAdminReports(input: unknown): Promise<{
  items: AdminReportRow[];
  total: number;
} | null> {
  try {
    const parsed = adminReportsQuerySchema.parse(input);
    const { supabase } = await requireAdmin();

    const cacheKey = adminReportsCacheKey(parsed);
    return await getOrSet(cacheKey, CACHE_TTL_SECONDS.adminReports, async () => {
      let query = supabase
        .from("reports")
        .select(
          "id, created_at, status, category, reporter_id, reporter_role, title, reported_url, evidence_storage_path",
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range(parsed.offset, parsed.offset + parsed.limit - 1);

      if (parsed.status) query = query.eq("status", parsed.status);
      if (parsed.reporterRole) query = query.eq("reporter_role", parsed.reporterRole);
      if (parsed.q) {
        const { postgrestIlikeClause } = await import(
          "@/lib/security/postgrest-filter"
        );
        query = query.or(
          [
            postgrestIlikeClause("title", parsed.q),
            postgrestIlikeClause("description_markdown", parsed.q),
            postgrestIlikeClause("reported_url", parsed.q),
          ].join(",")
        );
      }

      const { data, count, error } = await query;
      if (error) {
        safeError("getAdminReports:", error);
        return { items: [], total: 0 };
      }

      return {
        items: (data ?? []).map((r) => ({
          id: r.id,
          createdAt: r.created_at,
          status: r.status,
          category: r.category,
          reporterId: r.reporter_id,
          reporterRole: r.reporter_role,
          title: r.title,
          reportedUrl: r.reported_url,
          hasEvidence: Boolean(r.evidence_storage_path),
        })),
        total: count ?? 0,
      };
    });
  } catch (err) {
    safeError("getAdminReports:", err);
    return null;
  }
}

export type AdminReportDeepDive = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: (typeof REPORT_STATUSES)[number];
  category: (typeof REPORT_CATEGORIES)[number];
  reporterId: string;
  reporterRole: string;
  title: string | null;
  descriptionMarkdown: string;
  reportedUrl: string | null;
  appArea: string | null;
  userAgent: string | null;
  adminNotes: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  evidenceSignedUrl: string | null;
  evidenceStoragePath: string | null;
  evidenceMimeType: string | null;
  evidenceFileSizeBytes: number | null;
};

export async function getAdminReportById(
  reportId: string
): Promise<AdminReportDeepDive | null> {
  try {
    const id = z.string().uuid().parse(reportId);
    await requireAdmin();

    const adminSupabase = await createAdminClient();
    const { data, error } = await adminSupabase
      .from("reports")
      .select(
        "id, created_at, updated_at, status, category, reporter_id, reporter_role, title, description_markdown, reported_url, app_area, user_agent, admin_notes, resolved_at, resolved_by, evidence_storage_path, evidence_mime_type, evidence_file_size_bytes"
      )
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      if (error) safeError("getAdminReportById:", error);
      return null;
    }

    let evidenceStoragePath = data.evidence_storage_path;
    if (!evidenceStoragePath) {
      evidenceStoragePath = await resolveReportEvidencePath(
        adminSupabase,
        data.reporter_id,
        data.id,
        null
      );

      if (evidenceStoragePath) {
        await adminSupabase
          .from("reports")
          .update({
            evidence_storage_path: evidenceStoragePath,
            evidence_mime_type: evidenceStoragePath.endsWith(".png")
              ? "image/png"
              : "image/jpeg",
          })
          .eq("id", data.id);
      }
    }

    const evidenceSignedUrl = evidenceStoragePath
      ? await signReportEvidenceUrl(adminSupabase, evidenceStoragePath)
      : null;

    return {
      id: data.id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      status: data.status,
      category: data.category,
      reporterId: data.reporter_id,
      reporterRole: data.reporter_role,
      title: data.title,
      descriptionMarkdown: data.description_markdown,
      reportedUrl: data.reported_url,
      appArea: data.app_area,
      userAgent: data.user_agent,
      adminNotes: data.admin_notes,
      resolvedAt: data.resolved_at,
      resolvedBy: data.resolved_by,
      evidenceSignedUrl,
      evidenceStoragePath,
      evidenceMimeType: data.evidence_mime_type,
      evidenceFileSizeBytes: data.evidence_file_size_bytes,
    };
  } catch (err) {
    safeError("getAdminReportById:", err);
    return null;
  }
}

const updateReportSchema = z
  .object({
    reportId: z.string().uuid(),
    status: z.enum(REPORT_STATUSES),
    adminNotes: z.string().trim().max(5000).optional(),
  })
  .strict();

export async function updateReportStatus(input: unknown) {
  return runAction("updateReportStatus", async () => {
    const parsed = updateReportSchema.safeParse(input);
    if (!parsed.success) return fail("Invalid update.");

    const { supabase, user } = await requireAdmin();
    const now = new Date().toISOString();

    const update: Record<string, unknown> = {
      status: parsed.data.status,
      admin_notes: parsed.data.adminNotes?.trim() ? parsed.data.adminNotes.trim() : null,
      updated_at: now,
    };

    if (parsed.data.status === "resolved") {
      update.resolved_at = now;
      update.resolved_by = user.id;
    }

    const { error } = await supabase
      .from("reports")
      .update(update)
      .eq("id", parsed.data.reportId);

    if (error) {
      safeError("updateReportStatus:", error);
      return fail("Failed to update report.");
    }

    const { logAdminAction } = await import("@/actions/admin-actions");
    await logAdminAction("update_report_status", "report", parsed.data.reportId, {
      status: parsed.data.status,
    });

    await cacheDel(CacheKeys.adminReportsList("all"));
    revalidatePath("/admin/reports");
    return ok();
  });
}

const createJobReportSchema = z
  .object({
    jobId: z.string().uuid(),
    reason: z.string().min(1, "Reason is required"),
    description: z.string().min(10, "Please provide at least 10 characters of description").max(1000),
  })
  .strict();

export async function createJobReport(input: unknown) {
  return runAction("createJobReport", async () => {
    const parsed = createJobReportSchema.safeParse(input);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid report.");
    }

    const ctx = await requireRole(["worker"]);
    const rate = await rateLimitReportSubmission(ctx.profile.id);
    if (!rate.success) return fail(rate.error);

    const authUserId = ctx.profile.id;

    // Check for duplicate reports by the same worker for the same job
    const { data: existingReport, error: checkError } = await ctx.supabase
      .from("reported_jobs")
      .select("id")
      .eq("job_id", parsed.data.jobId)
      .eq("reporter_id", authUserId)
      .maybeSingle();

    if (checkError) {
      safeError("createJobReport check existing:", checkError);
      return fail("Failed to verify report status.");
    }

    if (existingReport) {
      return fail("You have already reported this job post.");
    }

    const { data: inserted, error: insertError } = await ctx.supabase
      .from("reported_jobs")
      .insert({
        job_id: parsed.data.jobId,
        reporter_id: authUserId,
        reason: parsed.data.reason,
        description: parsed.data.description,
        status: "PENDING",
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      safeError("createJobReport insert:", insertError);
      return fail("Failed to submit job report.");
    }

    await cacheDel(CacheKeys.adminReportsList("all"));
    revalidatePath("/admin/reports");
    return ok({ reportId: inserted.id });
  });
}

const adminJobReportsQuerySchema = z
  .object({
    status: z.enum(["PENDING", "REVIEWED", "DISMISSED"]).optional(),
    q: z.string().trim().max(120).optional(),
    limit: z.number().int().min(10).max(100).default(25),
    offset: z.number().int().min(0).default(0),
  })
  .strict();

export type AdminJobReportsQuery = z.infer<typeof adminJobReportsQuerySchema>;

export type AdminJobReportRow = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: "PENDING" | "REVIEWED" | "DISMISSED";
  reason: string;
  description: string;
  adminNotes: string | null;
  jobId: string;
  jobTitle: string;
  employerId: string;
  reporterId: string;
  reporterEmail?: string;
  reporterName?: string;
};

export async function getAdminJobReports(input: unknown): Promise<{
  items: AdminJobReportRow[];
  total: number;
} | null> {
  try {
    const parsed = adminJobReportsQuerySchema.parse(input);
    const { supabase } = await requireAdmin();

    let query = supabase
      .from("reported_jobs")
      .select(
        `
        id,
        created_at,
        updated_at,
        status,
        reason,
        description,
        admin_notes,
        job_id,
        reporter_id,
        jobs:job_id (
          title,
          employer_id
        ),
        profiles:reporter_id (
          email,
          first_name,
          middle_name,
          last_name
        )
        `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(parsed.offset, parsed.offset + parsed.limit - 1);

    if (parsed.status) {
      query = query.eq("status", parsed.status);
    }
    if (parsed.q) {
      const { postgrestIlikeClause } = await import(
        "@/lib/security/postgrest-filter"
      );
      query = query.or(
        [
          postgrestIlikeClause("reason", parsed.q),
          postgrestIlikeClause("description", parsed.q),
        ].join(",")
      );
    }

    const { data, count, error } = await query;
    if (error) {
      safeError("getAdminJobReports:", error);
      return { items: [], total: 0 };
    }

    interface DbJobReport {
      id: string;
      created_at: string;
      updated_at: string;
      status: string;
      reason: string;
      description: string;
      admin_notes: string | null;
      job_id: string;
      reporter_id: string;
      jobs: { title: string; employer_id: string } | { title: string; employer_id: string }[] | null;
      profiles: { email: string; first_name: string | null; middle_name: string | null; last_name: string | null } | { email: string; first_name: string | null; middle_name: string | null; last_name: string | null }[] | null;
    }

    const items: AdminJobReportRow[] = (data as unknown as DbJobReport[] ?? []).map((r) => {
      const job = Array.isArray(r.jobs) ? r.jobs[0] : r.jobs;
      const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
      const reporterName = profile
        ? formatFullName(profile.first_name, profile.middle_name, profile.last_name)
        : "";

      return {
        id: r.id,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        status: r.status as "PENDING" | "REVIEWED" | "DISMISSED",
        reason: r.reason,
        description: r.description,
        adminNotes: r.admin_notes,
        jobId: r.job_id,
        jobTitle: job?.title ?? "Unknown Job",
        employerId: job?.employer_id ?? "",
        reporterId: r.reporter_id,
        reporterEmail: profile?.email ?? "",
        reporterName: reporterName || "Unknown Worker",
      };
    });

    return {
      items,
      total: count ?? 0,
    };
  } catch (err) {
    safeError("getAdminJobReports:", err);
    return null;
  }
}

const updateJobReportStatusSchema = z
  .object({
    reportId: z.string().uuid(),
    status: z.enum(["PENDING", "REVIEWED", "DISMISSED"]),
    adminNotes: z.string().trim().max(5000).optional(),
  })
  .strict();

export async function updateJobReportStatus(input: unknown) {
  return runAction("updateJobReportStatus", async () => {
    const parsed = updateJobReportStatusSchema.safeParse(input);
    if (!parsed.success) return fail("Invalid update.");

    const { supabase } = await requireAdmin();
    const now = new Date().toISOString();

    const update: Record<string, unknown> = {
      status: parsed.data.status,
      admin_notes: parsed.data.adminNotes?.trim() ? parsed.data.adminNotes.trim() : null,
      updated_at: now,
    };

    const { error } = await supabase
      .from("reported_jobs")
      .update(update)
      .eq("id", parsed.data.reportId);

    if (error) {
      safeError("updateJobReportStatus:", error);
      return fail("Failed to update job report.");
    }

    const { logAdminAction } = await import("@/actions/admin-actions");
    await logAdminAction("update_job_report_status", "job_report", parsed.data.reportId, {
      status: parsed.data.status,
    });

    await cacheDel(CacheKeys.adminReportsList("all"));
    revalidatePath("/admin/reports");
    return ok();
  });
}


