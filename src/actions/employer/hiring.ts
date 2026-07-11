"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { safeError } from "@/utils/logger";
import { formatFullName } from "@/lib/format/name";
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

      const { data: jobs } = await supabase
        .from("jobs")
        .select("id, title")
        .eq("employer_id", profile.id);

      const jobIds = jobs?.map((j) => j.id) ?? [];
      if (jobIds.length === 0) return [];

      const jobTitleById = new Map(jobs!.map((j) => [j.id, j.title]));

      const { data: applications, error } = await supabase
        .from("applications")
        .select(`
          id,
          job_id,
          candidate_id,
          created_at,
          profiles ( first_name, middle_name, last_name ),
          interviews (
            id,
            scheduled_at,
            meeting_link,
            status,
            notes
          )
        `)
        .in("job_id", jobIds)
        .eq("status", "INTERVIEW_SCHEDULED")
        .order("created_at", { ascending: false });

      if (error) {
        safeError("Failed to fetch employer interviews:", error);
        return [];
      }

      return (applications ?? []).map((app: any) => {
        const candidate = app.profiles as {
          first_name?: string;
          middle_name?: string;
          last_name?: string;
        } | null;
        const name = candidate
          ? formatFullName(candidate.first_name, candidate.middle_name, candidate.last_name)
          : "Candidate";

        const interview = Array.isArray(app.interviews)
          ? app.interviews[0]
          : app.interviews;

        return {
          id: interview?.id || undefined,
          applicationId: app.id,
          jobId: app.job_id,
          candidateId: app.candidate_id,
          jobTitle: jobTitleById.get(app.job_id) ?? "Job",
          candidateName: isPreview
            ? previewDisplayName(app.candidate_id)
            : name || "Candidate",
          scheduledAt: interview?.scheduled_at || app.created_at,
          meetingUrl: interview?.meeting_link || null,
          status: interview?.status || "scheduled",
          notes: interview?.notes || null,
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
    .select("id, cover_letter")
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

  const finalIdentityMode = (identityMode === "full" && preview.identity_mode === "full") ? "full" : "anonymous_preview";
  const resumeCheck = await assertEmployerResumeDownload(profile.id);
  const workerSkills = asWorkerSkills(candidate.worker_skills);
  const workerProjects = asWorkerProjects(candidate.worker_projects);
  const showHourly = planSlug !== "discovery";

  return {
    jobTitle: job.title,
    jobId: job.id,
    identityMode: finalIdentityMode as "full" | "anonymous_preview",
    planSlug,
    resumeDownloadEnabled,
    messagingEnabled,
    isPinned,
    messagingThreadId,
    coverLetter: (application?.cover_letter as string | null) ?? null,
    candidate: {
      id: String(candidate.id ?? parsed.data.candidateId),
      name: formatFullName(candidate.first_name as string | null, candidate.middle_name as string | null, candidate.last_name as string | null),
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

export async function updateInterviewSchedule(input: {
  interviewId: string;
  scheduledAt: string;
  meetingLink?: string;
  notes?: string;
}) {
  try {
    const schema = z.object({
      interviewId: z.string().uuid(),
      scheduledAt: z.string().refine((val) => new Date(val) > new Date(), {
        message: "Interview date must be in the future",
      }),
      meetingLink: z.string().url().optional().or(z.literal("")),
      notes: z.string().optional(),
    });

    const parsed = schema.parse(input);
    const { supabase, profile } = await requireRole("employer");

    // Verify the user making the request is the Employer who owns this interview
    const { data: interview, error: intError } = await supabase
      .from("interviews")
      .select("id, employer_id, application_id, worker_id, job_id")
      .eq("id", parsed.interviewId)
      .single();

    if (intError || !interview) {
      return { success: false, error: "Interview record not found." };
    }

    if (interview.employer_id !== profile.id) {
      return { success: false, error: "Unauthorized access to this interview." };
    }

    const { error: updateError } = await supabase
      .from("interviews")
      .update({
        scheduled_at: parsed.scheduledAt,
        meeting_link: parsed.meetingLink ? parsed.meetingLink.trim() : null,
        notes: parsed.notes ? parsed.notes.trim() : null,
        status: "scheduled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.interviewId);

    if (updateError) {
      safeError("Failed to update interview:", updateError);
      return { success: false, error: "Failed to update interview schedule." };
    }

    try {
      // Fetch Employer Company Name
      const { data: company } = await supabase
        .from("company_profiles")
        .select("company_name")
        .eq("employer_id", profile.id)
        .maybeSingle();

      let employerName = company?.company_name;

      if (!employerName) {
        const { data: empProfile } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", profile.id)
          .maybeSingle();
        employerName = empProfile
          ? `${empProfile.first_name || ""} ${empProfile.last_name || ""}`.trim()
          : "";
      }

      if (!employerName) {
        employerName = "An Employer";
      }

      // Fetch Job Title
      const { data: job } = await supabase
        .from("jobs")
        .select("title")
        .eq("id", interview.job_id)
        .maybeSingle();

      const jobTitle = job?.title ?? "Job";

      // Format Date and Time
      const formattedDate = new Date(parsed.scheduledAt).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const formattedTime = new Date(parsed.scheduledAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      });

      const messageText = `${employerName} has rescheduled your interview for the ${jobTitle} role to ${formattedDate} at ${formattedTime}.`;

      // Trigger DB Notification
      await supabase.rpc("create_notification", {
        p_user_id: interview.worker_id,
        p_type: "interview_rescheduled",
        p_title: "Interview Rescheduled",
        p_message: messageText,
        p_action_url: "/worker/interviews",
        p_metadata: {
          interview_id: parsed.interviewId,
          job_id: interview.job_id,
          application_id: interview.application_id,
        },
      });
    } catch (notifyErr) {
      safeError("Failed to create reschedule notification:", notifyErr);
    }

    // Invalidate caches
    await invalidateEmployerHiringCache(profile.id);
    await invalidateWorkerCache(interview.worker_id);

    revalidatePath(`/employer/jobs/${interview.job_id}/applicants`);
    revalidatePath("/employer/interviews");
    revalidatePath(`/worker/applications/${interview.application_id}`);
    revalidatePath("/worker/applications");
    revalidatePath("/worker/interviews");

    return { success: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message ?? "Invalid input data." };
    }
    safeError("updateInterviewSchedule:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}
