"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/server/auth/session";
import { requireAdmin } from "@/lib/server/auth/require-admin";
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
    descriptionMarkdown: z.string().trim().min(30).max(10_000),
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

    const h = await headers();
    const userAgent = h.get("user-agent");

    const { data: inserted, error } = await ctx.supabase
      .from("reports")
      .insert({
        reporter_id: ctx.profile.id,
        reporter_role: ctx.profile.role,
        category: parsed.data.category,
        status: "open",
        title: parsed.data.title?.trim() ? parsed.data.title.trim() : null,
        description_markdown: parsed.data.descriptionMarkdown,
        reported_url: parsed.data.reportedUrl?.trim() ? parsed.data.reportedUrl.trim() : null,
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

const MAX_REPORT_EVIDENCE_BYTES = 5 * 1024 * 1024;
const ALLOWED_REPORT_EVIDENCE_TYPES = ["image/jpeg", "image/png"] as const;

export async function uploadReportEvidence(reportId: string, formData: FormData) {
  return runAction("uploadReportEvidence", async () => {
    const id = z.string().uuid().safeParse(reportId);
    if (!id.success) return fail("Invalid report.");

    const ctx = await requireRole(["worker", "employer"]);
    const rate = await rateLimitReportSubmission(ctx.profile.id);
    if (!rate.success) return fail(rate.error);

    const file = formData.get("file");
    if (!(file instanceof File)) return fail("No file provided.");

    if (file.size > MAX_REPORT_EVIDENCE_BYTES) {
      return fail("File must be 5 MB or smaller.");
    }

    if (
      !ALLOWED_REPORT_EVIDENCE_TYPES.includes(
        file.type as (typeof ALLOWED_REPORT_EVIDENCE_TYPES)[number]
      )
    ) {
      return fail("Use JPEG or PNG files only.");
    }

    const { data: report } = await ctx.supabase
      .from("reports")
      .select("id, reporter_id, evidence_storage_path")
      .eq("id", id.data)
      .maybeSingle();

    if (!report || report.reporter_id !== ctx.profile.id) {
      return fail("Report not found.");
    }

    if (report.evidence_storage_path) {
      await ctx.supabase.storage
        .from("report-evidence")
        .remove([report.evidence_storage_path]);
    }

    const extension =
      file.name.includes(".")
        ? file.name.split(".").pop()
        : file.type === "image/png"
          ? "png"
          : "jpg";
    const storagePath = `${ctx.profile.id}/${id.data}/${crypto.randomUUID()}.${extension}`;

    const fileBuffer = await file.arrayBuffer();
    const { error: uploadError } = await ctx.supabase.storage
      .from("report-evidence")
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      safeError("uploadReportEvidence storage:", uploadError);
      return fail("Failed to upload evidence.");
    }

    const { error: updateError } = await ctx.supabase
      .from("reports")
      .update({
        evidence_storage_path: storagePath,
        evidence_mime_type: file.type,
        evidence_file_size_bytes: file.size,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id.data);

    if (updateError) {
      safeError("uploadReportEvidence db:", updateError);
      return fail("Failed to save evidence.");
    }

    await cacheDel(CacheKeys.adminReportsList("all"));
    revalidatePath("/admin/reports");
    return ok();
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
};

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
          "id, created_at, status, category, reporter_id, reporter_role, title, reported_url",
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range(parsed.offset, parsed.offset + parsed.limit - 1);

      if (parsed.status) query = query.eq("status", parsed.status);
      if (parsed.reporterRole) query = query.eq("reporter_role", parsed.reporterRole);
      if (parsed.q) {
        // simple ilike; avoid exposing FTS complexity
        const like = `%${parsed.q}%`;
        query = query.or(`title.ilike.${like},description_markdown.ilike.${like},reported_url.ilike.${like}`);
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
  hasEvidence: boolean;
};

export async function getAdminReportById(
  reportId: string
): Promise<AdminReportDeepDive | null> {
  try {
    const id = z.string().uuid().parse(reportId);
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("reports")
      .select(
        "id, created_at, updated_at, status, category, reporter_id, reporter_role, title, description_markdown, reported_url, app_area, user_agent, admin_notes, resolved_at, resolved_by, evidence_storage_path, evidence_mime_type"
      )
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;

    let evidenceSignedUrl: string | null = null;
    if (data.evidence_storage_path) {
      const { data: signed } = await supabase.storage
        .from("report-evidence")
        .createSignedUrl(data.evidence_storage_path, 60 * 15);
      evidenceSignedUrl = signed?.signedUrl ?? null;
    }

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
      hasEvidence: Boolean(data.evidence_storage_path),
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

    await cacheDel(CacheKeys.adminReportsList("all"));
    revalidatePath("/admin/reports");
    return ok();
  });
}

