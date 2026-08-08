"use server";

import { createClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";
import { revalidatePath } from "next/cache";
import {
  ApplyJobPageData,
  buildDefaultContactMethods,
  deriveJobCategoryBadge,
  jobApplicationFormSchema,
  type JobApplicationFormValues,
} from "@/types/job-application";
import { createAdminClient } from "@/lib/supabase/server";
import { resolveApplicantCapForJob } from "@/lib/server/entitlements";
import {
  invalidateEmployerApplicantsCache,
  invalidateWorkerCache,
} from "@/lib/server/redis-cache";
import { emitWorkerAuditLog } from "@/lib/server/audit/worker-events";
import { notifyEmployerNewApplicant } from "@/actions/email";
import { z } from "zod";
import type { Json } from "@/types/database";

export interface SubmitJobApplicationResult {
  success: boolean;
  error?: string;
  applicationId?: string;
}

const quickApplySchema = z.object({
  jobId: z.string().uuid("Invalid job"),
  messageId: z.string().uuid().optional(),
});

export async function getApplyJobPageData(
  jobId: string
): Promise<ApplyJobPageData | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: job, error: jobError } = await supabase
      .from("job_posts")
      .select(
        "id, title, employer_id, employment_type, monthly_salary, salary_currency, hours_per_week, skills, created_at, company_name, status"
      )
      .eq("id", jobId)
      .eq("status", "Active")
      .maybeSingle();

    if (jobError || !job?.id || !job.title || !job.employer_id) {
      if (jobError) safeError("getApplyJobPageData job:", jobError);
      return null;
    }

    const { data: company } = await supabase
      .from("company_profiles")
      .select("company_name")
      .eq("employer_id", job.employer_id)
      .maybeSingle();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, email, resume_url, portfolio_url, cv_url")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "worker") {
      return null;
    }

    const skills = job.skills ?? [];

    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("candidate_id", profile.id)
      .eq("job_id", jobId)
      .maybeSingle();

    return {
      job: {
        id: job.id,
        title: job.title,
        companyName: company?.company_name ?? job.company_name ?? "Unknown Company",
        categoryBadge: deriveJobCategoryBadge(skills, job.employment_type ?? ""),
        employmentType: job.employment_type ?? "Any",
        monthlySalary: Number(job.monthly_salary ?? 0),
        salaryCurrency: job.salary_currency ?? "PHP",
        hoursPerWeek: Number(job.hours_per_week ?? 0),
        skills,
        createdAt: job.created_at ?? new Date().toISOString(),
      },
      profileAssets: {
        resumeUrl: profile.resume_url ?? null,
        portfolioUrl: profile.portfolio_url ?? null,
        cvUrl: profile.cv_url ?? null,
      },
      defaultContactMethods: buildDefaultContactMethods({
        email: profile.email,
      }),
      hasApplied: Boolean(existing),
    };
  } catch (err) {
    safeError("getApplyJobPageData:", err);
    return null;
  }
}

async function insertJobApplication(input: {
  workerId: string;
  jobId: string;
  employerId: string;
  isPremiumPath: boolean | null;
  isVerified: boolean | null;
  jobTitle: string | null;
  jobDescription: string | null;
  jobSkills: string[] | null;
  applicationSubject: string;
  coverLetter: string;
  contactMethods: JobApplicationFormValues["contactMethods"];
}): Promise<SubmitJobApplicationResult> {
  if (input.isPremiumPath && !input.isVerified) {
    return {
      success: false,
      error:
        "This is a verified-only job. Complete worker verification before applying.",
    };
  }

  const admin = await createAdminClient();

  const { data: existing } = await admin
    .from("applications")
    .select("id")
    .eq("candidate_id", input.workerId)
    .eq("job_id", input.jobId)
    .maybeSingle();

  if (existing) {
    return { success: false, error: "You have already applied to this job." };
  }

  const { rateLimitJobApplication } = await import("@/lib/server/rate-limit");
  const rateCheck = await rateLimitJobApplication(input.workerId);
  if (!rateCheck.success) {
    return { success: false, error: rateCheck.error };
  }

  const cap = await resolveApplicantCapForJob(
    input.employerId,
    input.jobId,
    admin
  );

  const { data: workerProfile } = await admin
    .from("profiles")
    .select("skills, professional_title, bio")
    .eq("id", input.workerId)
    .maybeSingle();

  const { computeKeywordMatchScore } = await import(
    "@/lib/matching/keyword-match-score"
  );
  const matchScore = computeKeywordMatchScore({
    jobTitle: input.jobTitle,
    jobDescription: input.jobDescription,
    jobSkills: input.jobSkills,
    workerSkills: workerProfile?.skills,
    workerTitle: workerProfile?.professional_title,
    workerBio: workerProfile?.bio,
    coverLetter: input.coverLetter,
    applicationSubject: input.applicationSubject,
  });

  const { data: inserted, error: insertError } = await admin
    .from("applications")
    .insert({
      candidate_id: input.workerId,
      job_id: input.jobId,
      status: "PENDING",
      application_subject: input.applicationSubject,
      cover_letter: input.coverLetter,
      contact_methods: input.contactMethods as unknown as Json,
      is_within_plan_cap: cap.withinCap,
      received_at: new Date().toISOString(),
      match_score: matchScore,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    safeError("insertJobApplication:", insertError);
    return { success: false, error: "Failed to submit application." };
  }

  await invalidateWorkerCache(input.workerId);
  await invalidateEmployerApplicantsCache(input.employerId, input.jobId);

  await emitWorkerAuditLog(input.workerId, "worker.application_submitted", {
    application_id: inserted.id,
    job_id: input.jobId,
  });

  revalidatePath(`/worker/jobs/${input.jobId}`);
  revalidatePath(`/worker/jobs/${input.jobId}/apply`);
  revalidatePath("/worker/applications");
  revalidatePath("/worker/dashboard");
  revalidatePath(`/employer/jobs/${input.jobId}`);
  revalidatePath(`/employer/jobs/${input.jobId}/applicants`);
  revalidatePath("/employer/dashboard");
  revalidatePath("/worker/messages");

  try {
    await notifyEmployerNewApplicant({
      applicationId: inserted.id,
      jobId: input.jobId,
      employerId: input.employerId,
    });
  } catch (err) {
    safeError("insertJobApplication: failed to send employer email", err);
  }

  return { success: true, applicationId: inserted.id };
}

function padToMinLength(text: string, min: number, fallback: string): string {
  const trimmed = text.trim();
  if (trimmed.length >= min) return trimmed.slice(0, 5000);
  const base = trimmed || fallback;
  if (base.length >= min) return base.slice(0, 5000);
  return `${base}${" ".repeat(Math.max(0, min - base.length))}`.slice(0, 5000);
}

export async function submitJobApplication(
  input: JobApplicationFormValues
): Promise<SubmitJobApplicationResult> {
  try {
    const parsed = jobApplicationFormSchema.safeParse(input);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message ?? "Invalid form data.";
      return { success: false, error: firstIssue };
    }

    const { jobId, applicationSubject, coverLetter, contactMethods } =
      parsed.data;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Please log in to apply." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, is_verified")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "worker") {
      return { success: false, error: "Worker account required." };
    }

    const { data: job } = await supabase
      .from("job_posts")
      .select("id, employer_id, is_premium_path, title, description, skills")
      .eq("id", jobId)
      .eq("status", "Active")
      .maybeSingle();

    if (!job?.employer_id) {
      return { success: false, error: "This job is no longer available." };
    }

    return insertJobApplication({
      workerId: profile.id,
      jobId,
      employerId: job.employer_id,
      isPremiumPath: job.is_premium_path,
      isVerified: profile.is_verified,
      jobTitle: job.title,
      jobDescription: job.description,
      jobSkills: job.skills,
      applicationSubject,
      coverLetter,
      contactMethods,
    });
  } catch (err) {
    safeError("submitJobApplication:", err);
    return { success: false, error: "Unexpected error." };
  }
}

/**
 * One-tap apply from a skill-match chat message.
 * Does not require an employer-first message — system_match opens the thread.
 */
export async function quickApplyFromChat(input: {
  jobId: string;
  messageId?: string;
}): Promise<SubmitJobApplicationResult> {
  try {
    const parsed = quickApplySchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid request." };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Please log in to apply." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "id, role, is_verified, email, professional_title, bio, skills, experience_years"
      )
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "worker") {
      return { success: false, error: "Worker account required." };
    }

    const { data: job } = await supabase
      .from("job_posts")
      .select("id, employer_id, is_premium_path, title, description, skills")
      .eq("id", parsed.data.jobId)
      .eq("status", "Active")
      .maybeSingle();

    if (!job?.employer_id || !job.title) {
      return { success: false, error: "This job is no longer available." };
    }

    if (parsed.data.messageId) {
      const { data: message } = await supabase
        .from("chat_messages")
        .select("id, message_kind, payload, thread_id")
        .eq("id", parsed.data.messageId)
        .eq("message_kind", "system_match")
        .maybeSingle();

      if (!message) {
        return { success: false, error: "Match message not found." };
      }

      const payload = message.payload as { jobId?: string } | null;
      if (payload?.jobId && payload.jobId !== parsed.data.jobId) {
        return { success: false, error: "Message does not match this job." };
      }

      const { data: thread } = await supabase
        .from("chat_threads")
        .select("id, worker_id, job_id")
        .eq("id", message.thread_id)
        .maybeSingle();

      if (!thread || thread.worker_id !== profile.id) {
        return { success: false, error: "Access denied." };
      }
    }

    const contactMethods = buildDefaultContactMethods({ email: profile.email });
    if (!contactMethods[0]?.value?.trim()) {
      return {
        success: false,
        error: "Add an email to your profile before applying.",
      };
    }

    const titleSnippet = profile.professional_title?.trim() || "your role";
    const applicationSubject = `Application for ${job.title}`.slice(0, 200);
    const skillLine =
      (profile.skills ?? []).slice(0, 5).join(", ") || "my relevant skills";
    const coverSeed = [
      `I'm interested in the ${job.title} position.`,
      profile.bio?.trim()
        ? profile.bio.trim().slice(0, 400)
        : `I bring experience as ${titleSnippet} and can contribute with ${skillLine}.`,
      "I'd welcome the chance to discuss how I can help your team. This application was submitted via Quick Apply from a skill match.",
    ].join(" ");

    const coverLetter = padToMinLength(
      coverSeed,
      50,
      `I'm interested in applying for ${job.title} and believe my background is a strong fit. Looking forward to connecting.`
    );

    return insertJobApplication({
      workerId: profile.id,
      jobId: parsed.data.jobId,
      employerId: job.employer_id,
      isPremiumPath: job.is_premium_path,
      isVerified: profile.is_verified,
      jobTitle: job.title,
      jobDescription: job.description,
      jobSkills: job.skills,
      applicationSubject:
        applicationSubject.length >= 5
          ? applicationSubject
          : `Application for ${job.title}`,
      coverLetter,
      contactMethods,
    });
  } catch (err) {
    safeError("quickApplyFromChat:", err);
    return { success: false, error: "Unexpected error." };
  }
}
