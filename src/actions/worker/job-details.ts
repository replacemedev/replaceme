"use server";

import { createClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";
import { revalidatePath } from "next/cache";
import { computeJobHourlyRate } from "@/types/job-search";
import {
  WorkerJobDetails,
  parseJobDescription,
} from "@/types/job-details";

export async function getWorkerJobDetails(
  jobId: string
): Promise<WorkerJobDetails | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: job, error } = await supabase
      .from("job_posts")
      .select("*")
      .eq("id", jobId)
      .eq("status", "Active")
      .maybeSingle();

    if (error || !job?.id || !job.title || !job.employer_id) {
      if (error) safeError("getWorkerJobDetails job:", error);
      return null;
    }

    const { data: company } = await supabase
      .from("company_profiles")
      .select("id, employer_id, company_name, logo_url, website_url, created_at")
      .eq("employer_id", job.employer_id)
      .maybeSingle();

    const { count: activePostsCount } = await supabase
      .from("job_posts")
      .select("*", { count: "exact", head: true })
      .eq("employer_id", job.employer_id)
      .eq("status", "Active");

    let isSaved = false;
    let hasApplied = false;

    if (user) {
      const { data: saved } = await supabase
        .from("worker_saved_jobs")
        .select("id")
        .eq("worker_id", user.id)
        .eq("job_id", jobId)
        .maybeSingle();
      isSaved = Boolean(saved);

      const { data: application } = await supabase
        .from("applications")
        .select("id")
        .eq("candidate_id", user.id)
        .eq("job_id", jobId)
        .maybeSingle();
      hasApplied = Boolean(application);
    }

    const monthlySalary = Number(job.monthly_salary ?? 0);
    const hoursPerWeek = Number(job.hours_per_week ?? 0);
    const description = job.description ?? "";

    return {
      id: job.id,
      employerId: job.employer_id,
      title: job.title,
      companyName: company?.company_name ?? job.company_name ?? "Unknown Company",
      employmentType: job.employment_type ?? "Any",
      description,
      parsedSections: parseJobDescription(description),
      monthlySalary,
      hoursPerWeek,
      hourlyRate: computeJobHourlyRate(monthlySalary, hoursPerWeek),
      location: job.location ?? "Remote",
      skills: job.skills ?? [],
      createdAt: job.created_at ?? new Date().toISOString(),
      updatedAt: job.updated_at ?? job.created_at ?? new Date().toISOString(),
      isSaved,
      hasApplied,
      company: {
        id: company?.id ?? "",
        employerId: job.employer_id,
        companyName: company?.company_name ?? job.company_name ?? "Unknown Company",
        logoUrl: company?.logo_url ?? job.logo_url ?? null,
        memberSince: company?.created_at ?? job.created_at ?? new Date().toISOString(),
        websiteUrl: company?.website_url ?? null,
        activeJobPostsCount: activePostsCount ?? 0,
      },
    };
  } catch (err) {
    safeError("getWorkerJobDetails:", err);
    return null;
  }
}

export async function applyForJob(
  jobId: string
): Promise<{ success: boolean; error?: string }> {
  try {
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
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "worker") {
      return { success: false, error: "Worker account required." };
    }

    const { data: job } = await supabase
      .from("job_posts")
      .select("id")
      .eq("id", jobId)
      .eq("status", "Active")
      .maybeSingle();

    if (!job) {
      return { success: false, error: "This job is no longer available." };
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

    const { error: insertError } = await supabase.from("applications").insert({
      candidate_id: profile.id,
      job_id: jobId,
      status: "PENDING",
    });

    if (insertError) {
      safeError("applyForJob:", insertError);
      return { success: false, error: "Failed to submit application." };
    }

    revalidatePath(`/worker/jobs/${jobId}`);
    revalidatePath("/worker/applications");
    revalidatePath("/worker/dashboard");

    return { success: true };
  } catch (err) {
    safeError("applyForJob:", err);
    return { success: false, error: "Unexpected error." };
  }
}
