"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { safeError, safeLog } from "@/utils/logger";
import { createJobSchema, CreateJobInput, DropdownOption, jobIdSchema, updateJobSchema, UpdateJobInput } from "@/lib/validations/employer/jobs";
import { requireRole } from "@/lib/server/auth/session";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { closeJobOwnedByEmployer } from "@/lib/server/dal/jobs";
import { revalidatePath } from "next/cache";
import { JobDetails } from "@/types/employer/jobs";
import { DEFAULT_SKILL_OPTIONS } from "@/config/onboarding";
import {
  assertEmployerCanPostJob,
  countHiddenApplicantsForJob,
  countVisibleApplicantsForJob,
  fetchEmployerEntitlements,
  invalidateEmployerCache,
  jobStatusForApprovalMode,
  priorityScoreForPlan,
} from "@/lib/server/entitlements";

/**
 * Fetch list of employment types. 
 * Currently returns standard static values from database categories.
 */
export async function getEmploymentTypes(): Promise<DropdownOption[]> {
  return [
    { label: "Full Time", value: "full-time" },
    { label: "Part Time", value: "part-time" },
    { label: "Contract", value: "contract" },
  ];
}

/**
 * Fetch searchable skills list.
 * Returns core platform skills list.
 */
export async function getSkills(): Promise<DropdownOption[]> {
  return DEFAULT_SKILL_OPTIONS.map((skill) => ({
    label: skill,
    value: skill,
  }));
}

/**
 * Server Action to create a new job post.
 * Implements strict zero-trust session validation and role checks, inserting directly to database.
 */
export async function createJobPost(payload: CreateJobInput) {
  try {
    safeLog("[Jobs] Create job post Server Action initiated");

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication failed. Please log in again." };
    }

    // Verify employer role in database
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "employer") {
      return { error: "Access denied. Only employers can post jobs." };
    }

    // Strictly validate the payload structure using Zod
    const parsed = createJobSchema.safeParse(payload);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || "Invalid form submission payload.";
      return { error: errorMsg };
    }

    const entitlementCheck = await assertEmployerCanPostJob(profile.id, supabase);
    if (!entitlementCheck.allowed) {
      return {
        error: entitlementCheck.error,
        denialType: entitlementCheck.denialType,
        suggestedPlan: entitlementCheck.suggestedPlan,
      };
    }

    const entitlements = await fetchEmployerEntitlements(profile.id, supabase);
    const jobStatus = jobStatusForApprovalMode(
      entitlements?.approvalMode ?? "queued_2d",
      parsed.data.intent === "premium" ? "premium" : "standard"
    );

    // Write the job to the database table
    // Compute monthly salary from hourly rate as source of truth
    const computedMonthly = Math.round(parsed.data.hourlyRate * (parsed.data.hoursPerWeek * 4));

    const { data: newJob, error: insertError } = await supabase
      .from("jobs")
      .insert({
        employer_id: profile.id,
        title: parsed.data.title,
        employment_type: parsed.data.employmentType,
        description: parsed.data.description,
        monthly_salary: computedMonthly,
        salary_currency: parsed.data.salaryCurrency,
        hours_per_week: parsed.data.hoursPerWeek,
        skills: parsed.data.skills,
        status: jobStatus,
        is_premium_path: parsed.data.intent === "premium",
        priority_score: entitlements ? priorityScoreForPlan(entitlements) : 0,
        submitted_for_review_at:
          jobStatus === "Pending Review" ? new Date().toISOString() : null,
        approved_at: jobStatus === "Active" ? new Date().toISOString() : null,
      })
      .select("id")
      .single();

    if (insertError || !newJob) {
      safeError("createJobPost insert error: [REDACTED_DB_ERROR]");
      return { error: "Failed to save job post to the database." };
    }

    safeLog(`[Jobs] Job post successfully created with intent: ${payload.intent}`);
    await invalidateEmployerCache(profile.id);
    revalidatePath("/employer/dashboard");
    revalidatePath("/employer/jobs");
    revalidatePath(`/employer/jobs/${newJob.id}`);

    return {
      success: true,
      message:
        jobStatus === "Active"
          ? "Job submitted and approved instantly! Redirecting..."
          : "Job submitted for review! Redirecting...",
      redirectUrl: `/employer/jobs/${newJob.id}`,
    };
  } catch (err) {
    safeError("createJobPost error occurred:", err);
    return { error: "An unexpected error occurred while saving the job post. Please try again." };
  }
}

/**
 * Server Action to update an existing job post owned by the employer.
 */
export async function updateJobPost(payload: UpdateJobInput) {
  try {
    const parsed = updateJobSchema.safeParse(payload);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || "Invalid form submission payload.";
      return { error: errorMsg };
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication failed. Please log in again." };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "employer") {
      return { error: "Access denied. Only employers can edit jobs." };
    }

    const { data: existing, error: existingError } = await supabase
      .from("jobs")
      .select("id, status")
      .eq("id", parsed.data.jobId)
      .eq("employer_id", profile.id)
      .maybeSingle();

    if (existingError || !existing) {
      return { error: "Job not found or access denied." };
    }

    if (existing.status === "Closed") {
      return { error: "Closed jobs cannot be edited." };
    }

    const updatedMonthly = Math.round(parsed.data.hourlyRate * (parsed.data.hoursPerWeek * 4));

    const { error: updateError } = await supabase
      .from("jobs")
      .update({
        title: parsed.data.title,
        employment_type: parsed.data.employmentType,
        description: parsed.data.description,
        monthly_salary: updatedMonthly,
        salary_currency: parsed.data.salaryCurrency,
        hours_per_week: parsed.data.hoursPerWeek,
        skills: parsed.data.skills,
      })
      .eq("id", parsed.data.jobId)
      .eq("employer_id", profile.id);

    if (updateError) {
      safeError("updateJobPost update error: [REDACTED_DB_ERROR]");
      return { error: "Failed to update job post." };
    }

    await invalidateEmployerCache(profile.id);

    revalidatePath("/employer/dashboard");
    revalidatePath("/employer/jobs");
    revalidatePath(`/employer/jobs/${parsed.data.jobId}`);

    return {
      success: true,
      message: "Job updated successfully!",
      redirectUrl: `/employer/jobs/${parsed.data.jobId}`,
    };
  } catch (err) {
    safeError("updateJobPost error occurred:", err);
    return { error: "An unexpected error occurred while updating the job post." };
  }
}

/**
 * Fetch raw job row for edit form prefill.
 */
export async function getJobForEdit(jobId: string) {
  const parsed = jobIdSchema.safeParse({ jobId });
  if (!parsed.success) return null;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "employer") return null;

  const { data: job } = await supabase
    .from("jobs")
    .select("id, title, employment_type, description, monthly_salary, salary_currency, hours_per_week, skills, status")
    .eq("id", parsed.data.jobId)
    .eq("employer_id", profile.id)
    .maybeSingle();

  if (!job || job.status === "Closed") return null;

  const fetchedHoursPerWeek = Number(job.hours_per_week);
  const fetchedMonthly = Number(job.monthly_salary);
  const derivedHourlyRate = fetchedHoursPerWeek > 0
    ? Math.round(fetchedMonthly / (fetchedHoursPerWeek * 4))
    : 0;

  return {
    id: job.id,
    title: job.title,
    employmentType: job.employment_type,
    description: job.description,
    hourlyRate: derivedHourlyRate,
    monthlySalary: fetchedMonthly,
    salaryCurrency: job.salary_currency ?? "PHP",
    hoursPerWeek: fetchedHoursPerWeek,
    skills: (job.skills as string[]) ?? [],
  };
}

/**
 * Fetch a single job details securely.
 * Checks session, confirms role, and validates owner via IDOR filter.
 */
export async function getJobById(jobId: string): Promise<JobDetails | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // Verify role is employer
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "employer") {
      return null;
    }

    // Fetch specific job with owner validation
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("employer_id", profile.id) // IDOR prevention
      .single();

    if (jobError || !job) {
      return null;
    }

    // Dynamic stats aggregation from database
    const { count: totalApplications } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("job_id", jobId);

    const visibleApplications = await countVisibleApplicantsForJob(
      supabase,
      jobId
    );
    const hiddenApplications = await countHiddenApplicantsForJob(
      supabase,
      jobId
    );

    const { count: shortlistedCount } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("job_id", jobId)
      .eq("status", "UNDER_REVIEW");

    const hoursPerWeek = Number(job.hours_per_week);
    const monthlySalary = Number(job.monthly_salary);
    const hourlyRate = hoursPerWeek > 0
      ? Math.round(monthlySalary / (hoursPerWeek * 4))
      : 0;

    // Map database model to high-fidelity frontend structures
    return {
      id: job.id,
      title: job.title,
      status: job.status as "Active" | "Closed" | "Pending Review",
      location: "Remote",
      employmentType: job.employment_type,
      hourlyRate,
      monthlySalary,
      hoursPerWeek,
      description: job.description,
      requiredSkills: job.skills || [],
      performance: {
        totalViews: job.views_count || 0,
        viewsTrend: "+12%",
        totalApplications: totalApplications || 0,
        visibleApplications,
        hiddenApplications,
        applicationsTrend: "+5%",
        shortlistedCount: shortlistedCount || 0,
      },
      priorityScore: Number(job.priority_score ?? 0),
      hiringTeam: {
        name: job.hiring_manager_name ?? "Hiring team",
        role: job.hiring_manager_role ?? "Recruiter",
        avatarUrl: null,
        email: job.hiring_manager_email ?? null,
      }
    };
  } catch (err) {
    safeError("getJobById error occurred:", err);
    return null;
  }
}

/**
 * Deactivates or closes a job posting.
 * Verifies session, role, and confirms job ownership before deactivation.
 */
export async function deactivateJob(jobId: string) {
  const result = await runAction("deactivateJob", async () => {
    const parsed = jobIdSchema.parse({ jobId });
    safeLog(`[Jobs] Deactivate job action initiated for job ID: ${parsed.jobId}`);

    const { supabase, profile } = await requireRole("employer");

    const { data: updatedJob, error: updateError } = await closeJobOwnedByEmployer(
      supabase,
      parsed.jobId,
      profile.id
    );

    if (updateError || !updatedJob) {
      return fail("Failed to deactivate job. Please check ownership and try again.");
    }

    safeLog(`[Jobs] Job ID: ${parsed.jobId} successfully deactivated`);
    await invalidateEmployerCache(profile.id);
    revalidatePath("/employer/dashboard");
    revalidatePath("/employer/jobs");
    return ok({ message: "Job post deactivated successfully!" });
  });

  if (!result.success) {
    return { error: result.error };
  }

  return { success: true, message: result.data?.message ?? "Job post deactivated successfully!" };
}

/**
 * Increments the views count for a target job.
 * Executes securely via RPC.
 */
export async function trackJobView(jobId: string) {
  try {
    const parsed = jobIdSchema.parse({ jobId });
    const supabase = await createAdminClient();
    await supabase.rpc("increment_job_views", { target_job_id: parsed.jobId });
  } catch (err) {
    safeError("trackJobView error: [REDACTED]");
  }
}

/**
 * Increments the clicks count for a target job.
 * Executes securely via RPC.
 */
export async function trackJobClick(jobId: string) {
  try {
    const parsed = jobIdSchema.parse({ jobId });
    const supabase = await createAdminClient();
    await supabase.rpc("increment_job_clicks", { target_job_id: parsed.jobId });
  } catch (err) {
    safeError("trackJobClick error: [REDACTED]");
  }
}
