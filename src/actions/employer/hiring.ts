"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { requireRole } from "@/lib/server/auth/session";
import { uuidSchema } from "@/lib/validations/common";
import { updateApplicationStatus } from "@/actions/applications";
import {
  assertEmployerFullIdentity,
  assertEmployerResumeDownload,
  fetchApplicantPreview,
  fetchEmployerEntitlements,
  type BillingIdentityMode,
} from "@/lib/server/entitlements";
import { previewDisplayName } from "@/lib/entitlements/ui-copy";

const scheduleInterviewSchema = z
  .object({ applicationId: uuidSchema })
  .strict();

export async function scheduleInterview(applicationId: string) {
  const { profile } = await requireRole("employer");
  const identityCheck = await assertEmployerFullIdentity(profile.id);
  if (!identityCheck.allowed) {
    return { success: false, error: identityCheck.error };
  }
  return updateApplicationStatus(applicationId, "INTERVIEW_SCHEDULED");
}

const sendOfferSchema = z
  .object({ applicationId: uuidSchema })
  .strict();

export async function sendJobOffer(applicationId: string) {
  const result = await runAction("sendJobOffer", async () => {
    const parsed = sendOfferSchema.parse({ applicationId });
    const { supabase, profile } = await requireRole("employer");

    const identityCheck = await assertEmployerFullIdentity(profile.id);
    if (!identityCheck.allowed) {
      return fail(identityCheck.error);
    }

    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("id, job_id, candidate_id, status")
      .eq("id", parsed.applicationId)
      .single();

    if (appError || !application) {
      return fail("Application not found.");
    }

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id, monthly_salary, hours_per_week, employment_type")
      .eq("id", application.job_id)
      .eq("employer_id", profile.id)
      .maybeSingle();

    if (jobError || !job) {
      return fail("Access denied. You do not own this job.");
    }

    const { data: existingOffer } = await supabase
      .from("contracts")
      .select("id")
      .eq("employer_id", profile.id)
      .eq("worker_id", application.candidate_id)
      .eq("job_id", application.job_id)
      .in("status", ["offered", "active"])
      .maybeSingle();

    if (existingOffer) {
      return fail("An offer already exists for this candidate.");
    }

    const monthlyHours = Number(job.hours_per_week) * 4;
    const hourlyRate =
      monthlyHours > 0
        ? Math.round(Number(job.monthly_salary) / monthlyHours)
        : 0;

    const { error: insertError } = await supabase.from("contracts").insert({
      employer_id: profile.id,
      worker_id: application.candidate_id,
      job_id: application.job_id,
      hourly_rate: hourlyRate,
      weekly_hours: Number(job.hours_per_week),
      employment_type: job.employment_type,
      status: "offered",
    });

    if (insertError) {
      return fail("Failed to send offer.");
    }

    await supabase
      .from("applications")
      .update({ status: "HIRED" })
      .eq("id", parsed.applicationId);

    revalidatePath(`/employer/jobs/${application.job_id}/applicants`);
    revalidatePath("/employer/hired");
    revalidatePath("/employer/interviews");
    revalidatePath("/worker/contracts");
    revalidatePath("/worker/applications");

    return ok({ message: "Offer sent successfully!" });
  });

  return result.success
    ? { success: true, message: result.data?.message }
    : { error: result.error };
}

export interface EmployerInterviewRow {
  applicationId: string;
  jobId: string;
  candidateId: string;
  jobTitle: string;
  candidateName: string;
  scheduledAt: string;
  isPreview: boolean;
}

export async function getEmployerInterviews(): Promise<EmployerInterviewRow[]> {
  const { supabase, profile } = await requireRole("employer");

  const entitlements = await fetchEmployerEntitlements(profile.id, supabase);
  const isPreview = entitlements?.identityMode === "anonymous_preview";

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title")
    .eq("employer_id", profile.id);

  const jobIds = jobs?.map((j) => j.id) ?? [];
  if (jobIds.length === 0) return [];

  const jobTitleById = new Map(jobs!.map((j) => [j.id, j.title]));

  const { data: applications } = await supabase
    .from("applications")
    .select("id, job_id, candidate_id, updated_at, profiles(first_name, last_name)")
    .in("job_id", jobIds)
    .eq("status", "INTERVIEW_SCHEDULED")
    .order("updated_at", { ascending: false });

  return (applications ?? []).map((app) => {
    const candidate = app.profiles as { first_name?: string; last_name?: string } | null;
    const name = candidate
      ? `${candidate.first_name ?? ""} ${candidate.last_name ?? ""}`.trim()
      : "Candidate";

    return {
      applicationId: app.id,
      jobId: app.job_id,
      candidateId: app.candidate_id,
      jobTitle: jobTitleById.get(app.job_id) ?? "Job",
      candidateName: isPreview
        ? previewDisplayName(app.candidate_id)
        : name || "Candidate",
      scheduledAt: app.updated_at,
      isPreview,
    };
  });
}

const candidateViewSchema = z
  .object({
    candidateId: uuidSchema,
    jobId: uuidSchema,
  })
  .strict();

export async function getEmployerCandidateProfile(
  candidateId: string,
  jobId: string
) {
  const parsed = candidateViewSchema.safeParse({ candidateId, jobId });
  if (!parsed.success) return null;

  const { supabase, profile } = await requireRole("employer");

  const { data: job } = await supabase
    .from("jobs")
    .select("id, title")
    .eq("id", parsed.data.jobId)
    .eq("employer_id", profile.id)
    .maybeSingle();

  if (!job) return null;

  const { data: application } = await supabase
    .from("applications")
    .select("id")
    .eq("job_id", parsed.data.jobId)
    .eq("candidate_id", parsed.data.candidateId)
    .eq("is_within_plan_cap", true)
    .maybeSingle();

  if (!application) return null;

  const [entitlements, preview] = await Promise.all([
    fetchEmployerEntitlements(profile.id, supabase),
    fetchApplicantPreview(supabase, application.id, profile.id),
  ]);

  const { data: pinRow } = await supabase
    .from("pinned_workers")
    .select("worker_id")
    .eq("employer_id", profile.id)
    .eq("worker_id", parsed.data.candidateId)
    .maybeSingle();

  const isPinned = Boolean(pinRow);
  const messagingEnabled = entitlements?.messagingEnabled ?? false;

  const { data: threadRow } = await supabase
    .from("chat_threads")
    .select("id")
    .eq("job_id", parsed.data.jobId)
    .eq("worker_id", parsed.data.candidateId)
    .maybeSingle();

  const messagingThreadId = threadRow?.id ?? null;

  if (!preview) {
    return null;
  }

  const identityMode: BillingIdentityMode =
    entitlements?.identityMode ?? preview.identity_mode;
  const planSlug = entitlements?.planSlug ?? "discovery";
  const resumeDownloadEnabled = entitlements?.resumeDownloadEnabled ?? false;
  const candidate = preview.candidate;
  const skills = Array.isArray(candidate.skills)
    ? (candidate.skills as string[])
    : [];

  if (identityMode === "full" && preview.identity_mode === "full") {
    const resumeCheck = await assertEmployerResumeDownload(profile.id);

    return {
      jobTitle: job.title,
      jobId: job.id,
      identityMode: "full" as const,
      planSlug,
      resumeDownloadEnabled,
      messagingEnabled,
      isPinned,
      messagingThreadId,
      candidate: {
        id: String(candidate.id ?? parsed.data.candidateId),
        name: `${candidate.first_name ?? ""} ${candidate.last_name ?? ""}`.trim(),
        title: String(candidate.professional_title ?? "Professional"),
        bio: (candidate.bio as string | null) ?? null,
        skills,
        experienceYears: Number(candidate.experience_years ?? 0),
        avatarUrl: (candidate.avatar_url as string | null) ?? null,
        email: (candidate.email as string | null) ?? null,
        isVerified: Boolean(candidate.is_verified),
        resumeUrl: resumeCheck.allowed
          ? ((candidate.resume_url as string | null) ?? null)
          : null,
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
      },
    };
  }

  return {
    jobTitle: job.title,
    jobId: job.id,
    identityMode: "anonymous_preview" as const,
    planSlug,
    resumeDownloadEnabled,
    messagingEnabled,
    isPinned,
    messagingThreadId,
    candidate: {
      id: String(candidate.id ?? parsed.data.candidateId),
      name: previewDisplayName(parsed.data.candidateId),
      title: String(candidate.professional_title ?? "Professional"),
      bio: null,
      skills,
      experienceYears: Number(candidate.experience_years ?? 0),
      avatarUrl: null,
      email: null,
      isVerified: false,
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
    },
  };
}
