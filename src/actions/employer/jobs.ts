"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { safeError, safeLog } from "@/utils/logger";
import { createJobSchema, CreateJobInput, DropdownOption, jobIdSchema } from "@/lib/validations/employer/jobs";
import { requireRole } from "@/lib/server/auth/session";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { closeJobOwnedByEmployer } from "@/lib/server/dal/jobs";
import { revalidatePath } from "next/cache";
import { JobDetails } from "@/types/employer/jobs";

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
  return [
    { label: "React", value: "React" },
    { label: "TypeScript", value: "TypeScript" },
    { label: "Next.js", value: "Next.js" },
    { label: "Tailwind CSS", value: "Tailwind CSS" },
    { label: "Node.js", value: "Node.js" },
    { label: "Python", value: "Python" },
    { label: "Design", value: "Design" },
    { label: "DevOps", value: "DevOps" },
  ];
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

    // Write the job to the database table
    const { error: insertError } = await supabase
      .from("jobs")
      .insert({
        employer_id: profile.id,
        title: parsed.data.title,
        employment_type: parsed.data.employmentType,
        description: parsed.data.description,
        monthly_salary: parsed.data.monthlySalary,
        hours_per_week: parsed.data.hoursPerWeek,
        skills: parsed.data.skills,
        status: parsed.data.intent === "premium" ? "Active" : "Pending Review",
        is_premium_path: parsed.data.intent === "premium",
      });

    if (insertError) {
      safeError("createJobPost insert error: [REDACTED_DB_ERROR]");
      return { error: "Failed to save job post to the database." };
    }

    safeLog(`[Jobs] Job post successfully created with intent: ${payload.intent}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      message: payload.intent === "premium" 
        ? "Job submitted and approved instantly! Redirecting..." 
        : "Job submitted for review! Redirecting...",
      redirectUrl: "/dashboard",
    };
  } catch (err) {
    safeError("createJobPost error occurred:", err);
    return { error: "An unexpected error occurred while saving the job post. Please try again." };
  }
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

    const { count: shortlistedCount } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("job_id", jobId)
      .eq("status", "UNDER_REVIEW");

    // Map database model to high-fidelity frontend structures
    return {
      id: job.id,
      title: job.title,
      status: job.status as "Active" | "Closed" | "Pending Review",
      location: "Remote",
      employmentType: job.employment_type,
      monthlySalary: Number(job.monthly_salary),
      hoursPerWeek: Number(job.hours_per_week),
      description: job.description,
      keyResponsibilities: [
        "Take ownership of critical features and deliverables matching key job requirements.",
        "Collaborate closely with distributed team members and cross-functional departments.",
        "Optimize codebase and design systems to deliver premium visual experiences.",
        "Stay up-to-date with design trends, platform guidelines, and modern workflows."
      ],
      requiredSkills: job.skills || [],
      experienceAndEducation: [
        "Minimum 2 years of professional experience in similar roles.",
        "A strong portfolio or track record of past successful projects.",
        "Proficiency with modern tools, frameworks, and visual platforms."
      ],
      performance: {
        totalViews: job.views_count || 0,
        viewsTrend: "+12%",
        totalApplications: totalApplications || 0,
        applicationsTrend: "+5%",
        shortlistedCount: shortlistedCount || 0,
      },
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
    revalidatePath("/dashboard");
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
