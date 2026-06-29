"use server";

import { safeError, safeLog } from "@/utils/logger";
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
  fetchApplicantPreview,
  fetchEmployerEntitlements,
} from "@/lib/server/entitlements";
import type { BillingIdentityMode } from "@/lib/server/entitlements";

function matchLabelFromScore(matchScore: number): MatchLabel {
  if (matchScore >= 90) return "high";
  if (matchScore < 70) return "low";
  return "mid";
}

import { previewDisplayName } from "@/lib/entitlements/ui-copy";

function mapPreviewToApplicant(
  app: {
    id: string;
    job_id: string;
    candidate_id: string;
    status: string;
    match_score: number | null;
    created_at: string;
  },
  preview: Awaited<ReturnType<typeof fetchApplicantPreview>>,
  identityMode: BillingIdentityMode
): Applicant | null {
  if (!preview) return null;

  const candidate = preview.candidate;
  const isFull = identityMode === "full";
  const skills = Array.isArray(candidate.skills)
    ? (candidate.skills as string[])
    : [];
  const matchScore = preview.match_score ?? app.match_score ?? 0;

  if (isFull) {
    const firstName = String(candidate.first_name ?? "");
    const lastName = String(candidate.last_name ?? "");
    return {
      id: app.id,
      jobId: app.job_id,
      candidateId: app.candidate_id,
      name: `${firstName} ${lastName}`.trim() || previewDisplayName(app.candidate_id),
      role: String(candidate.professional_title ?? "Developer"),
      matchScore,
      matchLabel: matchLabelFromScore(matchScore),
      status: app.status as ApplicationStatus,
      skills,
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

/**
 * Fetch applicants for a job with entitlement-aware identity (preview vs full).
 */
export async function getApplicants(jobId: string): Promise<{
  applicants: Applicant[];
  creditsBalance: number;
  identityMode: BillingIdentityMode;
  resumeDownloadEnabled: boolean;
  messagingEnabled: boolean;
  applicantsPerJobLimit: number | null;
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
        error: "Access denied. You do not own this job posting.",
      };
    }

    const entitlements = await fetchEmployerEntitlements(profile.id, supabase);
    const identityMode = entitlements?.identityMode ?? "anonymous_preview";

    const { data: applications, error: appsError } = await supabase
      .from("applications")
      .select("id, job_id, candidate_id, status, match_score, created_at")
      .eq("job_id", parsed.jobId)
      .eq("is_within_plan_cap", true)
      .order("created_at", { ascending: false });

    if (appsError) {
      safeError("Error fetching applications:", appsError);
    }

    const { data: threads } = await supabase
      .from("chat_threads")
      .select("id, worker_id")
      .eq("job_id", parsed.jobId);

    const threadByWorker = new Map(
      (threads ?? []).map((thread) => [thread.worker_id, thread.id])
    );

    const dbApplicants: Applicant[] = [];

    for (const app of applications ?? []) {
      const preview = await fetchApplicantPreview(
        supabase,
        app.id,
        profile.id
      );
      const mapped = mapPreviewToApplicant(app, preview, identityMode);
      if (mapped) {
        dbApplicants.push({
          ...mapped,
          messagingThreadId: threadByWorker.get(app.candidate_id) ?? null,
        });
      }
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
