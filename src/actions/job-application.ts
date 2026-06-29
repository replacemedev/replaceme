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

export interface SubmitJobApplicationResult {
  success: boolean;
  error?: string;
  applicationId?: string;
}

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
        "id, title, employer_id, employment_type, monthly_salary, hours_per_week, skills, created_at, company_name, status"
      )
      .eq("id", jobId)
      .eq("status", "Active")
      .maybeSingle();

    if (jobError || !job?.id || !job.title) {
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
      .select("id, role, email, phone_number, resume_url, portfolio_url, cv_url")
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
        phone_number: profile.phone_number,
      }),
      hasApplied: Boolean(existing),
    };
  } catch (err) {
    safeError("getApplyJobPageData:", err);
    return null;
  }
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
      .select("id, employer_id, is_premium_path")
      .eq("id", jobId)
      .eq("status", "Active")
      .maybeSingle();

    if (!job) {
      return { success: false, error: "This job is no longer available." };
    }

    if (job.is_premium_path && !profile.is_verified) {
      return {
        success: false,
        error:
          "This is a verified-only job. Complete worker verification before applying.",
      };
    }

    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("candidate_id", profile.id)
      .eq("job_id", jobId)
      .maybeSingle();

    if (existing) {
      return { success: false, error: "You have already applied to this job." };
    }

    const { rateLimitJobApplication } = await import("@/lib/server/rate-limit");
    const rateCheck = await rateLimitJobApplication(profile.id);
    if (!rateCheck.success) {
      return { success: false, error: rateCheck.error };
    }

    const admin = await createAdminClient();
    const cap = await resolveApplicantCapForJob(job.employer_id, jobId, admin);
    const withinPlanCap = cap.withinCap;

    const { data: inserted, error: insertError } = await admin
      .from("applications")
      .insert({
        candidate_id: profile.id,
        job_id: jobId,
        status: "PENDING",
        application_subject: applicationSubject,
        cover_letter: coverLetter,
        contact_methods: contactMethods,
        is_within_plan_cap: withinPlanCap,
        received_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      safeError("submitJobApplication:", insertError);
      return { success: false, error: "Failed to submit application." };
    }

    await invalidateWorkerCache(profile.id);
    await invalidateEmployerApplicantsCache(job.employer_id, jobId);

    await emitWorkerAuditLog(profile.id, "worker.application_submitted", {
      application_id: inserted.id,
      job_id: jobId,
    });

    revalidatePath(`/worker/jobs/${jobId}`);
    revalidatePath(`/worker/jobs/${jobId}/apply`);
    revalidatePath("/worker/applications");
    revalidatePath("/worker/dashboard");
    revalidatePath(`/employer/jobs/${jobId}`);
    revalidatePath(`/employer/jobs/${jobId}/applicants`);
    revalidatePath("/employer/dashboard");

    return { success: true, applicationId: inserted.id };
  } catch (err) {
    safeError("submitJobApplication:", err);
    return { success: false, error: "Unexpected error." };
  }
}
