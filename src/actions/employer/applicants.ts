"use server";

import { safeError, safeLog } from "@/utils/logger";
import { formatFullName } from "@/lib/format/name";
import { Applicant, MatchLabel } from "@/types/employer/applicants";
import { ApplicationStatus } from "@/types/applications";
import { revalidatePath } from "next/cache";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { requireRole } from "@/lib/server/auth/session";
import { unlockCandidateSchema } from "@/lib/validations/applicants";
import { jobIdSchema } from "@/lib/validations/employer/jobs";
import { getJobOwnedByEmployer } from "@/lib/server/dal/jobs";
import {
  assertEmployerFullIdentity,
  assertEmployerResumeDownload,
  countHiddenApplicantsForJob,
  fetchApplicantPreview,
  fetchEmployerEntitlements,
} from "@/lib/server/entitlements";
import type { BillingIdentityMode } from "@/lib/server/entitlements";
import {
  CacheKeys,
  CACHE_TTL_SECONDS,
  getOrSet,
} from "@/lib/server/redis-cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

function matchLabelFromScore(matchScore: number): MatchLabel {
  if (matchScore >= 90) return "high";
  if (matchScore < 70) return "low";
  return "mid";
}

import { previewDisplayName } from "@/lib/entitlements/ui-copy";

type ApplicationRow = {
  id: string;
  job_id: string;
  candidate_id: string;
  status: string;
  match_score: number | null;
  created_at: string;
};

/** Minimal row when preview RPC fails — keeps pipeline count aligned with jobs list. */
function fallbackApplicant(
  app: ApplicationRow,
  identityMode: BillingIdentityMode
): Applicant {
  const isFull = identityMode === "full";
  return {
    id: app.id,
    jobId: app.job_id,
    candidateId: app.candidate_id,
    name: previewDisplayName(app.candidate_id),
    role: "Incomplete Profile",
    matchScore: app.match_score ?? 0,
    matchLabel: matchLabelFromScore(app.match_score ?? 0),
    status: app.status as ApplicationStatus,
    skills: [],
    spokenLanguages: [],
    experienceYears: 0,
    isUnlocked: isFull,
    identityMode: isFull ? "full" : "anonymous_preview",
    avatarUrl: null,
    email: null,
    bio: null,
    resumeUrl: null,
    expectedSalaryMin: null,
    expectedSalaryMax: null,
    salaryCurrency: "USD",
    createdAt: app.created_at,
    isVerified: false,
  };
}

function mapPreviewToApplicant(
  app: ApplicationRow,
  preview: Awaited<ReturnType<typeof fetchApplicantPreview>>,
  identityMode: BillingIdentityMode
): Applicant {
  if (!preview) {
    return fallbackApplicant(app, identityMode);
  }

  const candidate = preview.candidate;
  const isFull = identityMode === "full";
  const skills = Array.isArray(candidate.skills)
    ? (candidate.skills as string[])
    : [];
  const spokenLanguages = Array.isArray(candidate.spoken_languages)
    ? (candidate.spoken_languages as string[]).filter(
        (lang): lang is string => typeof lang === "string" && lang.trim().length > 0
      )
    : [];
  const matchScore = preview.match_score ?? app.match_score ?? 0;

  if (isFull) {
    const name =
      formatFullName(
        candidate.first_name as string | null,
        (candidate.middle_name as string | null) ?? null,
        candidate.last_name as string | null,
        (candidate.suffix as string | null) ?? null
      ) || previewDisplayName(app.candidate_id);
    return {
      id: app.id,
      jobId: app.job_id,
      candidateId: app.candidate_id,
      name,
      role: String(candidate.professional_title ?? "Developer"),
      matchScore,
      matchLabel: matchLabelFromScore(matchScore),
      status: app.status as ApplicationStatus,
      skills,
      spokenLanguages,
      experienceYears: Number(candidate.experience_years ?? 0),
      isUnlocked: true,
      identityMode: "full",
      avatarUrl: (candidate.avatar_url as string | null) ?? null,
      email: (candidate.email as string | null) ?? null,
      bio: (candidate.bio as string | null) ?? null,
      resumeUrl: (candidate.resume_url as string | null) ?? null,
      expectedSalaryMin:
        candidate.expected_salary_min === null ||
        candidate.expected_salary_min === undefined
          ? null
          : Number(candidate.expected_salary_min),
      expectedSalaryMax:
        candidate.expected_salary_max === null ||
        candidate.expected_salary_max === undefined
          ? null
          : Number(candidate.expected_salary_max),
      salaryCurrency: (candidate.salary_currency as string | null) ?? "USD",
      createdAt: app.created_at,
      isVerified: Boolean(candidate.is_verified),
    };
  }

  return {
    id: app.id,
    jobId: app.job_id,
    candidateId: app.candidate_id,
    name: previewDisplayName(app.candidate_id),
    role: String(candidate.professional_title ?? "Candidate"),
    matchScore,
    matchLabel: matchLabelFromScore(matchScore),
    status: app.status as ApplicationStatus,
    skills,
    spokenLanguages,
    experienceYears: Number(candidate.experience_years ?? 0),
    isUnlocked: false,
    identityMode: "anonymous_preview",
    avatarUrl: null,
    email: null,
    bio: null,
    resumeUrl: null,
    expectedSalaryMin:
      candidate.expected_salary_min === null ||
      candidate.expected_salary_min === undefined
        ? null
        : Number(candidate.expected_salary_min),
    expectedSalaryMax:
      candidate.expected_salary_max === null ||
      candidate.expected_salary_max === undefined
        ? null
        : Number(candidate.expected_salary_max),
    salaryCurrency: (candidate.salary_currency as string | null) ?? "USD",
    createdAt: app.created_at,
    isVerified: false,
  };
}

type ApplicantsPayload = {
  applicants: Applicant[];
  creditsBalance: number;
  identityMode: BillingIdentityMode;
  resumeDownloadEnabled: boolean;
  messagingEnabled: boolean;
  applicantsPerJobLimit: number | null;
  hiddenApplicantCount: number;
};

async function loadApplicantsForJob(
  supabase: SupabaseClient<Database>,
  employerId: string,
  jobId: string
): Promise<ApplicantsPayload> {
  const entitlements = await fetchEmployerEntitlements(employerId, supabase);
  const identityMode = entitlements?.identityMode ?? "anonymous_preview";
  const hiddenApplicantCount = await countHiddenApplicantsForJob(supabase, jobId);

  const { data: applications, error: appsError } = await supabase
    .from("applications")
    .select(`
      id,
      job_id,
      candidate_id,
      status,
      match_score,
      created_at
    `)
    .eq("job_id", jobId)
    .eq("is_within_plan_cap", true)
    .neq("moderation_status", "suspended")
    .order("created_at", { ascending: false });

  if (appsError) {
    safeError("Error fetching applications:", appsError);
    throw new Error(`Failed to load applications for job ${jobId}`);
  }

  const { data: threads } = await supabase
    .from("chat_threads")
    .select("id, worker_id")
    .eq("job_id", jobId);

  const threadByWorker = new Map(
    (threads ?? []).map((thread) => [thread.worker_id, thread.id])
  );

  const dbApplicants: Applicant[] = [];
  let previewFailures = 0;

  for (const app of applications ?? []) {
    const preview = await fetchApplicantPreview(supabase, app.id, employerId);
    if (!preview) {
      previewFailures += 1;
      safeError("Applicant preview missing; using fallback row", {
        applicationId: app.id,
        jobId,
        candidateId: app.candidate_id,
      });
    }
    const mapped = mapPreviewToApplicant(app, preview, identityMode);
    dbApplicants.push({
      ...mapped,
      messagingThreadId: threadByWorker.get(app.candidate_id) ?? null,
    });
  }

  if (previewFailures > 0) {
    safeError("get_applicant_preview failures during loadApplicantsForJob", {
      jobId,
      employerId,
      previewFailures,
      applicationCount: applications?.length ?? 0,
    });
  }

  dbApplicants.sort((a, b) => {
    if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
    return b.matchScore - a.matchScore;
  });

  return {
    applicants: dbApplicants,
    creditsBalance: 0,
    identityMode,
    resumeDownloadEnabled: entitlements?.resumeDownloadEnabled ?? false,
    messagingEnabled: entitlements?.messagingEnabled ?? false,
    applicantsPerJobLimit: entitlements?.applicantsPerJobLimit ?? null,
    hiddenApplicantCount,
  };
}

/**
 * Fetch applicants for a job with entitlement-aware identity (preview vs full).
 */
export async function getApplicants(
  jobId: string,
  options?: {
    q?: string;
    status?: string;
    sort?: string;
  }
): Promise<{
  applicants: Applicant[];
  creditsBalance: number;
  identityMode: BillingIdentityMode;
  resumeDownloadEnabled: boolean;
  messagingEnabled: boolean;
  applicantsPerJobLimit: number | null;
  hiddenApplicantCount: number;
  error?: string;
}> {
  try {
    const parsed = jobIdSchema.parse({ jobId });
    const { supabase, profile } = await requireRole("employer");

    const { data: job, error: jobError } = await getJobOwnedByEmployer(
      supabase,
      parsed.jobId,
      profile.id
    );

    if (jobError || !job) {
      return {
        applicants: [],
        creditsBalance: 0,
        identityMode: "anonymous_preview",
        resumeDownloadEnabled: false,
        messagingEnabled: false,
        applicantsPerJobLimit: null,
        hiddenApplicantCount: 0,
        error: "Access denied. You do not own this job posting.",
      };
    }

    const result = await getOrSet(
      CacheKeys.employerApplicants(profile.id, parsed.jobId),
      CACHE_TTL_SECONDS.applicants,
      () => loadApplicantsForJob(supabase, profile.id, parsed.jobId)
    );

    let filtered = [...result.applicants];

    if (options?.status && options.status !== "all") {
      filtered = filtered.filter((a) => a.status === options.status);
    }

    if (options?.q && options.q.trim()) {
      const query = options.q.trim().toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.role.toLowerCase().includes(query) ||
          a.skills.some((s) => s.toLowerCase().includes(query))
      );
    }

    if (options?.sort) {
      filtered.sort((a, b) => {
        switch (options.sort) {
          case "oldest":
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          case "match":
            return b.matchScore - a.matchScore;
          case "name":
            return a.name.localeCompare(b.name);
          case "newest":
          default:
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        }
      });
    }

    return {
      ...result,
      applicants: filtered,
    };
  } catch (err) {
    safeError("getApplicants error occurred:", err);
    return {
      applicants: [],
      creditsBalance: 0,
      identityMode: "anonymous_preview",
      resumeDownloadEnabled: false,
      messagingEnabled: false,
      applicantsPerJobLimit: null,
      hiddenApplicantCount: 0,
      error: "An unexpected error occurred.",
    };
  }
}

/**
 * @deprecated Credit unlocks replaced by plan entitlements (Starter+ includes full identity).
 */
export async function unlockCandidate(
  applicationId: string
): Promise<{ success?: boolean; error?: string }> {
  const result = await runAction("unlockCandidate", async () => {
    const parsed = unlockCandidateSchema.parse({ applicationId });
    safeLog(`[Applicants] Deprecated unlock for app: ${parsed.applicationId}`);

    const { profile } = await requireRole("employer");
    const identityCheck = await assertEmployerFullIdentity(profile.id);

    if (identityCheck.allowed) {
      return ok();
    }

    return fail(identityCheck.error);
  });

  return result.success ? { success: true } : { error: result.error };
}

export async function assertResumeDownloadAllowed(
  employerId: string
): Promise<{ allowed: boolean; error?: string }> {
  const check = await assertEmployerResumeDownload(employerId);
  return check.allowed ? { allowed: true } : { allowed: false, error: check.error };
}
