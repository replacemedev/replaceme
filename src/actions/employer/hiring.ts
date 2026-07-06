"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { safeError } from "@/utils/logger";
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
import {
  CacheKeys,
  CACHE_TTL_SECONDS,
  getOrSet,
  invalidateEmployerApplicantsCache,
  invalidateEmployerHiringCache,
  invalidateWorkerCache,
} from "@/lib/server/redis-cache";

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

    await invalidateEmployerHiringCache(profile.id);
    await invalidateEmployerApplicantsCache(profile.id, application.job_id);
    await invalidateWorkerCache(application.candidate_id);

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
  id?: string;
  applicationId: string;
  jobId: string;
  candidateId: string;
  jobTitle: string;
  candidateName: string;
  scheduledAt: string;
  meetingUrl?: string | null;
  status?: string;
  notes?: string | null;
  isPreview: boolean;
}

export async function getEmployerInterviews(): Promise<EmployerInterviewRow[]> {
  const { supabase, profile } = await requireRole("employer");

  return getOrSet(
    CacheKeys.employerInterviews(profile.id),
    CACHE_TTL_SECONDS.employerHiring,
    async () => {
      const entitlements = await fetchEmployerEntitlements(profile.id, supabase);
      const isPreview = entitlements?.identityMode === "anonymous_preview";

      const { data: interviews, error } = await supabase
        .from("interviews")
        .select(`
          id,
          application_id,
          employer_id,
          worker_id,
          job_id,
          scheduled_at,
          meeting_link,
          status,
          notes,
          jobs ( title ),
          profiles!interviews_worker_id_fkey ( first_name, last_name )
        `)
        .eq("employer_id", profile.id)
        .order("scheduled_at", { ascending: true });

      if (error) {
        safeError("Failed to fetch employer interviews:", error);
        return [];
      }

      return (interviews ?? []).map((row: any) => {
        const candidate = row.profiles as {
          first_name?: string;
          last_name?: string;
        } | null;
        const name = candidate
          ? `${candidate.first_name ?? ""} ${candidate.last_name ?? ""}`.trim()
          : "Candidate";
        const job = row.jobs as { title: string } | null;

        return {
          id: row.id,
          applicationId: row.application_id,
          jobId: row.job_id,
          candidateId: row.worker_id,
          jobTitle: job?.title ?? "Job",
          candidateName: isPreview
            ? previewDisplayName(row.worker_id)
            : name || "Candidate",
          scheduledAt: row.scheduled_at,
          meetingUrl: row.meeting_link,
          status: row.status,
          notes: row.notes,
          isPreview,
        };
      });
    }
  );
}

const candidateViewSchema = z
  .object({
    candidateId: uuidSchema,
    jobId: uuidSchema,
  })
  .strict();

type WorkerSkillPreview = {
  id?: string;
  skill_name?: string;
  proficiency_label?: string;
};

type WorkerProjectPreview = {
  id?: string;
  title?: string;
  role?: string;
  year?: number;
  description?: string;
  skills_used?: string[];
};

function asWorkerSkills(value: unknown): WorkerSkillPreview[] {
  return Array.isArray(value) ? (value as WorkerSkillPreview[]) : [];
}

function asWorkerProjects(value: unknown): WorkerProjectPreview[] {
  return Array.isArray(value) ? (value as WorkerProjectPreview[]) : [];
}

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
    const workerSkills = asWorkerSkills(candidate.worker_skills);
    const workerProjects = asWorkerProjects(candidate.worker_projects);
    const showHourly = planSlug !== "discovery";

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
        workerSkills,
        workerProjects,
        experienceYears: Number(candidate.experience_years ?? 0),
        avatarUrl: (candidate.avatar_url as string | null) ?? null,
        email: (candidate.email as string | null) ?? null,
        isVerified: Boolean(candidate.is_verified),
        resumeUrl: resumeCheck.allowed
          ? ((candidate.resume_url as string | null) ?? null)
          : null,
        cvUrl: resumeCheck.allowed
          ? ((candidate.cv_url as string | null) ?? null)
          : null,
        location: (candidate.location as string | null) ?? null,
        phoneNumber: (candidate.phone_number as string | null) ?? null,
        portfolioUrl: (candidate.portfolio_url as string | null) ?? null,
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
        salaryCurrency: (candidate.salary_currency as string | null) ?? "PHP",
        hourlyRate:
          showHourly && candidate.hourly_rate != null
            ? Number(candidate.hourly_rate)
            : null,
        availability: showHourly
          ? ((candidate.availability as string | null) ?? null)
          : null,
      },
    };
  }
}

export async function createOrUpdateInterview(input: {
  applicationId: string;
  scheduledAt: string;
  meetingUrl?: string;
  notes?: string;
}) {
  try {
    const { supabase, profile } = await requireRole("employer");

    const identityCheck = await assertEmployerFullIdentity(profile.id);
    if (!identityCheck.allowed) {
      return { success: false, error: identityCheck.error };
    }

    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("id, job_id, candidate_id")
      .eq("id", input.applicationId)
      .single();

    if (appError || !application) {
      return { success: false, error: "Application not found." };
    }

    const { data: existing } = await supabase
      .from("interviews")
      .select("id")
      .eq("application_id", input.applicationId)
      .maybeSingle();

    let dbError;
    if (existing) {
      const { error } = await supabase
        .from("interviews")
        .update({
          scheduled_at: input.scheduledAt,
          meeting_link: input.meetingUrl || null,
          notes: input.notes || null,
          status: "scheduled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      dbError = error;
    } else {
      const { error } = await supabase
        .from("interviews")
        .insert({
          application_id: input.applicationId,
          employer_id: profile.id,
          worker_id: application.candidate_id,
          job_id: application.job_id,
          scheduled_at: input.scheduledAt,
          meeting_link: input.meetingUrl || null,
          notes: input.notes || null,
          status: "scheduled",
        });
      dbError = error;
    }

    if (dbError) {
      safeError("Failed to save interview in database:", dbError);
      return { success: false, error: "Failed to schedule interview." };
    }

    const statusResult = await updateApplicationStatus(input.applicationId, "INTERVIEW_SCHEDULED");
    if (!statusResult.success) {
      return { success: false, error: statusResult.error };
    }

    await invalidateEmployerHiringCache(profile.id);
    await invalidateWorkerCache(application.candidate_id);

    revalidatePath(`/employer/jobs/${application.job_id}/applicants`);
    revalidatePath("/employer/interviews");
    revalidatePath(`/worker/applications/${input.applicationId}`);
    revalidatePath("/worker/applications");
    revalidatePath("/worker/interviews");

    return { success: true };
  } catch (err) {
    safeError("createOrUpdateInterview error:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function cancelInterview(applicationId: string) {
  try {
    const { supabase, profile } = await requireRole("employer");

    const identityCheck = await assertEmployerFullIdentity(profile.id);
    if (!identityCheck.allowed) {
      return { success: false, error: identityCheck.error };
    }

    const { data: application } = await supabase
      .from("applications")
      .select("id, job_id, candidate_id")
      .eq("id", applicationId)
      .single();

    if (!application) {
      return { success: false, error: "Application not found." };
    }

    const { error: dbError } = await supabase
      .from("interviews")
      .update({ status: "cancelled" })
      .eq("application_id", applicationId);

    if (dbError) {
      safeError("Failed to cancel interview in database:", dbError);
      return { success: false, error: "Failed to cancel interview." };
    }

    const statusResult = await updateApplicationStatus(applicationId, "UNDER_REVIEW");
    if (!statusResult.success) {
      return { success: false, error: statusResult.error };
    }

    await invalidateEmployerHiringCache(profile.id);
    await invalidateWorkerCache(application.candidate_id);

    revalidatePath(`/employer/jobs/${application.job_id}/applicants`);
    revalidatePath("/employer/interviews");
    revalidatePath(`/worker/applications/${applicationId}`);
    revalidatePath("/worker/applications");
    revalidatePath("/worker/interviews");

    return { success: true };
  } catch (err) {
    safeError("cancelInterview error:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}
