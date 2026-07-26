"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdminCapability } from "@/lib/server/auth/require-capability";
import { createAdminClient } from "@/lib/supabase/server";
import { formatFullName } from "@/lib/format/name";
import { computeKeywordMatchScore } from "@/lib/matching/keyword-match-score";
import { logAdminAction } from "@/actions/admin-actions";
import { safeError } from "@/utils/logger";
import { isApplicationStatus } from "@/types/applications";
import type {
  AdminApplicationDeepDive,
  AdminApplicationRow,
  AdminApplicationsListResult,
  ApplicationModerationStatus,
} from "@/types/admin.types";

const RESUME_SIGNED_URL_TTL_SECONDS = 60 * 60;

async function resolveResumeSignedUrl(
  storagePath: string | null | undefined
): Promise<string | null> {
  if (!storagePath?.trim()) return null;
  const path = storagePath.trim();
  if (/^https?:\/\//i.test(path)) return path;

  const admin = await createAdminClient();
  const { data, error } = await admin.storage
    .from("resumes")
    .createSignedUrl(path, RESUME_SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    safeError("resolveResumeSignedUrl:", error);
    return null;
  }
  return data.signedUrl;
}

const PAGE_SIZE = 20;

type AdminApplicationsQuery = {
  search?: string;
  status?: string;
  from?: string;
  to?: string;
  moderation?: string;
  page?: number;
};

function parseModeration(
  value: string | null | undefined
): ApplicationModerationStatus {
  if (value === "flagged" || value === "suspended" || value === "clear") {
    return value;
  }
  return "clear";
}

function mapApplicationRow(row: {
  id: string;
  job_id: string;
  candidate_id: string;
  status: string;
  match_score: number | null;
  moderation_status?: string | null;
  created_at: string;
  jobs?: unknown;
  profiles?: unknown;
}): AdminApplicationRow {
  const job = Array.isArray(row.jobs) ? row.jobs[0] : row.jobs;
  const worker = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const jobRecord = job as
    | {
        title?: string | null;
        description?: string | null;
        skills?: string[] | null;
        profiles?: unknown;
      }
    | null
    | undefined;
  const workerRecord = worker as
    | {
        first_name?: string | null;
        middle_name?: string | null;
        last_name?: string | null;
        email?: string | null;
        is_verified?: boolean | null;
        skills?: string[] | null;
        professional_title?: string | null;
        bio?: string | null;
      }
    | null
    | undefined;

  const employerProfile = jobRecord?.profiles;
  const employer = Array.isArray(employerProfile)
    ? employerProfile[0]
    : employerProfile;
  const companyProfiles = (
    employer as { company_profiles?: unknown } | null | undefined
  )?.company_profiles;
  const company = Array.isArray(companyProfiles)
    ? companyProfiles[0]
    : companyProfiles;

  const storedScore = Number(row.match_score ?? 0);
  const matchScore =
    storedScore > 0
      ? storedScore
      : computeKeywordMatchScore({
          jobTitle: jobRecord?.title,
          jobDescription: jobRecord?.description,
          jobSkills: jobRecord?.skills,
          workerSkills: workerRecord?.skills,
          workerTitle: workerRecord?.professional_title,
          workerBio: workerRecord?.bio,
        });

  return {
    id: row.id,
    job_id: row.job_id,
    job_title: jobRecord?.title ?? null,
    company_name:
      (company as { company_name?: string | null } | null)?.company_name ?? null,
    worker_id: row.candidate_id,
    worker_name:
      formatFullName(
        workerRecord?.first_name,
        workerRecord?.middle_name,
        workerRecord?.last_name
      ) || null,
    worker_email: workerRecord?.email ?? null,
    worker_is_verified: Boolean(workerRecord?.is_verified),
    status: row.status,
    match_score: matchScore,
    moderation_status: parseModeration(row.moderation_status),
    created_at: row.created_at,
  };
}

async function resolveSearchFilters(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  search: string
): Promise<{ candidateIds: string[]; jobIds: string[] } | null> {
  const q = search.trim().replace(/[%_,.()]/g, " ").replace(/\s+/g, " ").trim();
  if (!q) return null;

  const pattern = `%${q}%`;

  const [workersRes, jobsRes, companiesRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id")
      .eq("role", "worker")
      .or(
        `email.ilike."${pattern}",first_name.ilike."${pattern}",last_name.ilike."${pattern}",middle_name.ilike."${pattern}"`
      )
      .limit(150),
    supabase.from("jobs").select("id").ilike("title", pattern).limit(150),
    supabase
      .from("company_profiles")
      .select("employer_id")
      .ilike("company_name", pattern)
      .limit(100),
  ]);

  const candidateIds = ((workersRes.data ?? []) as { id: string }[]).map(
    (r) => r.id
  );
  let jobIds = ((jobsRes.data ?? []) as { id: string }[]).map((r) => r.id);

  const employerIds = (
    (companiesRes.data ?? []) as { employer_id: string }[]
  ).map((r) => r.employer_id);

  if (employerIds.length > 0) {
    const { data: employerJobs } = await supabase
      .from("jobs")
      .select("id")
      .in("employer_id", employerIds)
      .limit(200);
    jobIds = [
      ...new Set([
        ...jobIds,
        ...((employerJobs ?? []) as { id: string }[]).map((j) => j.id),
      ]),
    ];
  }

  return { candidateIds, jobIds };
}

export async function fetchAdminApplications(
  query: AdminApplicationsQuery = {}
): Promise<AdminApplicationsListResult> {
  const { supabase } = await requireAdminCapability("applications");

  const page = Math.max(1, Number(query.page ?? 1) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const search = (query.search ?? "").trim();
  const status = query.status ?? "all";
  const moderation = query.moderation ?? "all";
  const dateFrom = query.from?.trim() || null;
  const dateTo = query.to?.trim() || null;

  let builder = supabase.from("applications").select(
    `
      id,
      job_id,
      candidate_id,
      status,
      match_score,
      moderation_status,
      created_at,
      jobs!applications_job_id_fkey (
        title,
        description,
        skills,
        profiles!jobs_employer_id_fkey (
          company_profiles ( company_name )
        )
      ),
      profiles!applications_candidate_id_fkey (
        first_name,
        middle_name,
        last_name,
        email,
        is_verified,
        skills,
        professional_title,
        bio
      )
    `,
    { count: "exact" }
  );

  if (status !== "all" && isApplicationStatus(status)) {
    builder = builder.eq("status", status);
  }

  if (
    moderation === "flagged" ||
    moderation === "suspended" ||
    moderation === "clear"
  ) {
    builder = builder.eq("moderation_status", moderation);
  }

  if (dateFrom) {
    builder = builder.gte("created_at", `${dateFrom}T00:00:00.000Z`);
  }
  if (dateTo) {
    builder = builder.lte("created_at", `${dateTo}T23:59:59.999Z`);
  }

  if (search) {
    const sanitized = search.replace(/[%_,.()]/g, " ").replace(/\s+/g, " ").trim();
    const ids = sanitized ? await resolveSearchFilters(supabase, sanitized) : null;
    if (ids) {
      const parts: string[] = [];
      if (ids.candidateIds.length > 0) {
        parts.push(`candidate_id.in.(${ids.candidateIds.join(",")})`);
      }
      if (ids.jobIds.length > 0) {
        parts.push(`job_id.in.(${ids.jobIds.join(",")})`);
      }
      parts.push(`application_subject.ilike."%${sanitized}%"`);
      parts.push(`cover_letter.ilike."%${sanitized}%"`);
      if (parts.length > 0) {
        builder = builder.or(parts.join(","));
      }
    }
  }

  const { data, error, count } = await builder
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    safeError("fetchAdminApplications:", error);
    throw new Error(error.message);
  }

  return {
    rows: (data ?? []).map((row) => mapApplicationRow(row)),
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  };
}

export async function fetchAdminApplicationDeepDive(
  applicationId: string
): Promise<AdminApplicationDeepDive | null> {
  try {
    const id = z.string().uuid().parse(applicationId);
    const { supabase } = await requireAdminCapability("applications");

    const { data, error } = await supabase
      .from("applications")
      .select(
        `
        id,
        job_id,
        candidate_id,
        status,
        match_score,
        moderation_status,
        flag_reason,
        flagged_at,
        application_subject,
        cover_letter,
        contact_methods,
        created_at,
        jobs!applications_job_id_fkey (
          title,
          description,
          skills,
          employer_id,
          profiles!jobs_employer_id_fkey (
            company_profiles ( company_name )
          )
        ),
        profiles!applications_candidate_id_fkey (
          first_name,
          middle_name,
          last_name,
          email,
          is_verified,
          skills,
          professional_title,
          bio,
          resume_url,
          cv_url
        )
      `
      )
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      if (error) safeError("fetchAdminApplicationDeepDive:", error);
      return null;
    }

    const mapped = mapApplicationRow(data);
    const job = Array.isArray(data.jobs) ? data.jobs[0] : data.jobs;
    const worker = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
    const jobRecord = job as
      | { employer_id?: string | null; title?: string | null }
      | null
      | undefined;
    const workerRecord = worker as
      | {
          resume_url?: string | null;
          cv_url?: string | null;
        }
      | null
      | undefined;

    const resumeStoragePath =
      workerRecord?.resume_url ?? workerRecord?.cv_url ?? null;

    const [{ data: history }, { data: audits }, workerResumeUrl] =
      await Promise.all([
        supabase
          .from("application_stage_history")
          .select("status, created_at, actor_role")
          .eq("application_id", id)
          .order("created_at", { ascending: true }),
        supabase
          .from("audit_logs")
          .select("id, action_type, created_at, metadata")
          .eq("target_type", "application")
          .eq("target_id", id)
          .order("created_at", { ascending: false })
          .limit(50),
        resolveResumeSignedUrl(resumeStoragePath),
      ]);

    return {
      id: mapped.id,
      jobId: mapped.job_id,
      jobTitle: mapped.job_title,
      employerId: jobRecord?.employer_id ?? null,
      companyName: mapped.company_name,
      workerId: mapped.worker_id,
      workerName: mapped.worker_name,
      workerEmail: mapped.worker_email,
      workerIsVerified: mapped.worker_is_verified,
      workerResumeUrl,
      hasWorkerResume: Boolean(resumeStoragePath),
      status: mapped.status,
      matchScore: mapped.match_score,
      moderationStatus: mapped.moderation_status,
      flagReason: data.flag_reason ?? null,
      flaggedAt: data.flagged_at ?? null,
      applicationSubject: data.application_subject ?? null,
      coverLetter: data.cover_letter ?? null,
      contactMethods: data.contact_methods,
      createdAt: mapped.created_at,
      stageHistory: (history ?? []).map((h) => ({
        status: h.status,
        createdAt: h.created_at,
        actorRole: h.actor_role,
      })),
      auditEvents: (audits ?? []).map((a) => ({
        id: a.id,
        actionType: a.action_type,
        createdAt: a.created_at,
        metadata: (a.metadata as Record<string, unknown>) ?? {},
      })),
    };
  } catch (err) {
    safeError("fetchAdminApplicationDeepDive:", err);
    return null;
  }
}

const moderateSchema = z.object({
  applicationId: z.string().uuid(),
  mode: z.enum(["flagged", "suspended"]),
  reason: z.string().trim().min(8).max(1000),
});

type ActionResult = { success: true } | { success: false; error: string };

function revalidateApplicationSurfaces(applicationId: string) {
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath("/admin/audit-log");
}

/** Time-limited signed URL for a worker resume in private storage. */
export async function getAdminApplicationResumeSignedUrl(
  applicationId: string
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    const id = z.string().uuid().parse(applicationId);
    await requireAdminCapability("applications");
    const admin = await createAdminClient();

    const { data, error } = await admin
      .from("applications")
      .select(
        `
        profiles!applications_candidate_id_fkey (
          resume_url,
          cv_url
        )
      `
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      safeError("getAdminApplicationResumeSignedUrl:", error);
      return { success: false, error: error.message };
    }

    const worker = Array.isArray(data?.profiles)
      ? data.profiles[0]
      : data?.profiles;
    const workerRecord = worker as
      | { resume_url?: string | null; cv_url?: string | null }
      | null
      | undefined;
    const storagePath =
      workerRecord?.resume_url ?? workerRecord?.cv_url ?? null;
    const url = await resolveResumeSignedUrl(storagePath);
    if (!url) {
      return { success: false, error: "Resume not found in storage." };
    }
    return { success: true, url };
  } catch (err) {
    safeError("getAdminApplicationResumeSignedUrl:", err);
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to open resume",
    };
  }
}

export async function moderateAdminApplication(input: {
  applicationId: string;
  mode: "flagged" | "suspended";
  reason: string;
}): Promise<ActionResult> {
  try {
    const parsed = moderateSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const { user } = await requireAdminCapability("applications");
    const admin = await createAdminClient();
    const { applicationId, mode, reason } = parsed.data;

    const { data: updated, error } = await admin
      .from("applications")
      .update({
        moderation_status: mode,
        flagged_at: new Date().toISOString(),
        flag_reason: reason,
        flagged_by: user.id,
      })
      .eq("id", applicationId)
      .select("id")
      .maybeSingle();

    if (error) {
      safeError("moderateAdminApplication:", error);
      return { success: false, error: error.message };
    }
    if (!updated?.id) {
      return {
        success: false,
        error: "Application not found or could not be updated.",
      };
    }

    await logAdminAction(
      mode === "suspended"
        ? "application.suspend"
        : "application.flag",
      "application",
      applicationId,
      { reason, moderation_status: mode }
    );

    revalidateApplicationSurfaces(applicationId);
    return { success: true };
  } catch (err) {
    safeError("moderateAdminApplication:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to moderate application",
    };
  }
}

export async function clearAdminApplicationFlag(
  applicationId: string
): Promise<ActionResult> {
  try {
    const id = z.string().uuid().parse(applicationId);
    await requireAdminCapability("applications");
    const admin = await createAdminClient();

    const { data: updated, error } = await admin
      .from("applications")
      .update({
        moderation_status: "clear",
        flagged_at: null,
        flag_reason: null,
        flagged_by: null,
      })
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }
    if (!updated?.id) {
      return {
        success: false,
        error: "Application not found or could not be updated.",
      };
    }

    await logAdminAction("application.clear_flag", "application", id, {});
    revalidateApplicationSurfaces(id);
    return { success: true };
  } catch (err) {
    safeError("clearAdminApplicationFlag:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to clear flag",
    };
  }
}
