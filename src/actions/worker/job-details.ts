"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";
import { invalidateEmployerApplicantsCache } from "@/lib/server/redis-cache";
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

    try {
      const admin = await createAdminClient();
      const { data: jobViews } = await admin
        .from("jobs")
        .select("views_count")
        .eq("id", jobId)
        .maybeSingle();
      if (jobViews) {
        await admin
          .from("jobs")
          .update({ views_count: (jobViews.views_count ?? 0) + 1 })
          .eq("id", jobId);
      }
      await invalidateEmployerApplicantsCache(job.employer_id, jobId);
    } catch (incrementErr) {
      safeError("getWorkerJobDetails increment views failed", incrementErr);
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
    const salaryCurrency = (job as { salary_currency?: string | null }).salary_currency ?? "PHP";
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
      salaryCurrency,
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
