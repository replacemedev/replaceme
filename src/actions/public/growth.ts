"use server";

import { cache } from "react";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";
import { invalidateEmployerApplicantsCache } from "@/lib/server/redis-cache";
import { computeJobHourlyRate } from "@/types/job-search";
import {
  parseJobDescription,
  type WorkerJobDetails,
} from "@/types/job-details";
import type {
  PublicCompanyListing,
  PublicJobListing,
} from "@/types/public-growth";

function mapPublicJob(row: {
  id: string | null;
  title: string | null;
  company_name: string | null;
  logo_url: string | null;
  employment_type: string | null;
  location: string | null;
  monthly_salary: number | null;
  hours_per_week: number | null;
  skills: string[] | null;
  created_at: string | null;
}): PublicJobListing | null {
  if (!row.id || !row.title) return null;
  const monthlySalary = Number(row.monthly_salary ?? 0);
  const hoursPerWeek = Number(row.hours_per_week ?? 0);
  return {
    id: row.id,
    title: row.title,
    companyName: row.company_name ?? "Employer",
    companyLogoUrl: row.logo_url ?? null,
    employmentType: row.employment_type ?? "Full-time",
    location: row.location ?? "Remote",
    monthlySalary,
    hoursPerWeek,
    hourlyRate: computeJobHourlyRate(monthlySalary, hoursPerWeek) ?? 0,
    skills: row.skills ?? [],
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

export async function getPublicJobListings(): Promise<PublicJobListing[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("job_posts")
      .select(
        "id, title, company_name, logo_url, employment_type, location, monthly_salary, hours_per_week, skills, created_at"
      )
      .eq("status", "Active")
      .order("created_at", { ascending: false });

    if (error) {
      safeError("getPublicJobListings:", error);
      return [];
    }

    return (data ?? [])
      .map(mapPublicJob)
      .filter((job): job is PublicJobListing => job !== null);
  } catch (err) {
    safeError("getPublicJobListings:", err);
    return [];
  }
}

/**
 * Deduped read for generateMetadata + page + OG image in the same request.
 * Side-effect free — call `trackPublicJobView` once from the page via `after()`.
 */
export const getPublicJobById = cache(
  async (jobId: string): Promise<WorkerJobDetails | null> => {
    try {
      const supabase = await createClient();
      const { data: job, error } = await supabase
        .from("job_posts")
        .select("*")
        .eq("id", jobId)
        .eq("status", "Active")
        .maybeSingle();

      if (error || !job?.id || !job.title || !job.employer_id) return null;

      const { data: company } = await supabase
        .from("company_profiles")
        .select("id, company_name, logo_url, website_url, created_at")
        .eq("employer_id", job.employer_id)
        .maybeSingle();

      const { count: activePostsCount } = await supabase
        .from("job_posts")
        .select("*", { count: "exact", head: true })
        .eq("employer_id", job.employer_id)
        .eq("status", "Active");

      const monthlySalary = Number(job.monthly_salary ?? 0);
      const salaryCurrency = job.salary_currency ?? "PHP";
      const hoursPerWeek = Number(job.hours_per_week ?? 0);
      const description = job.description ?? "";

      return {
        id: job.id,
        employerId: job.employer_id,
        title: job.title,
        companyName: company?.company_name ?? job.company_name ?? "Employer",
        employmentType: job.employment_type ?? "Full-time",
        description,
        parsedSections: parseJobDescription(description),
        monthlySalary,
        salaryCurrency,
        hoursPerWeek,
        hourlyRate: computeJobHourlyRate(monthlySalary, hoursPerWeek) ?? 0,
        location: job.location ?? "Remote",
        skills: job.skills ?? [],
        createdAt: job.created_at ?? new Date().toISOString(),
        updatedAt: job.updated_at ?? job.created_at ?? new Date().toISOString(),
        isSaved: false,
        hasApplied: false,
        company: {
          id: company?.id ?? "",
          employerId: job.employer_id,
          companyName: company?.company_name ?? job.company_name ?? "Employer",
          logoUrl: company?.logo_url ?? job.logo_url ?? null,
          memberSince:
            company?.created_at ?? job.created_at ?? new Date().toISOString(),
          websiteUrl: company?.website_url ?? null,
          activeJobPostsCount: activePostsCount ?? 0,
        },
      };
    } catch (err) {
      safeError("getPublicJobById:", err);
      return null;
    }
  }
);

/** Non-blocking view counter — invoke once per page render via `after()`. */
export async function trackPublicJobView(
  employerId: string,
  jobId: string
): Promise<void> {
  try {
    const ids = z
      .object({
        employerId: z.string().uuid(),
        jobId: z.string().uuid(),
      })
      .safeParse({ employerId, jobId });
    if (!ids.success) return;

    const { rateLimitJobAnalytics } = await import("@/lib/server/rate-limit");
    const rate = await rateLimitJobAnalytics();
    if (!rate.success) return;

    const admin = await createAdminClient();
    const { data: jobViews } = await admin
      .from("jobs")
      .select("views_count")
      .eq("id", ids.data.jobId)
      .maybeSingle();
    if (jobViews) {
      await admin
        .from("jobs")
        .update({ views_count: (jobViews.views_count ?? 0) + 1 })
        .eq("id", ids.data.jobId);
    }
    await invalidateEmployerApplicantsCache(ids.data.employerId, ids.data.jobId);
  } catch (incrementErr) {
    safeError("trackPublicJobView failed", incrementErr);
  }
}

export async function getPublicCompanyDirectory(): Promise<
  PublicCompanyListing[]
> {
  try {
    const supabase = await createClient();
    const { data: companies, error } = await supabase
      .from("company_profiles")
      .select(
        "id, employer_id, company_name, industry, company_size, logo_url, company_bio, website_url"
      )
      .order("company_name");

    if (error) {
      safeError("getPublicCompanyDirectory:", error);
      return [];
    }

    const listings: PublicCompanyListing[] = [];

    for (const row of companies ?? []) {
      const { count } = await supabase
        .from("job_posts")
        .select("*", { count: "exact", head: true })
        .eq("employer_id", row.employer_id)
        .eq("status", "Active");

      if (!count || count < 1) continue;

      listings.push({
        id: row.id,
        employerId: row.employer_id,
        companyName: row.company_name,
        industry: row.industry,
        companySize: row.company_size,
        logoUrl: row.logo_url,
        companyBio: row.company_bio,
        websiteUrl: row.website_url,
        activeJobCount: count,
      });
    }

    return listings;
  } catch (err) {
    safeError("getPublicCompanyDirectory:", err);
    return [];
  }
}

export async function getPublicCompanyById(
  companyId: string
): Promise<{ company: PublicCompanyListing; jobs: PublicJobListing[] } | null> {
  try {
    const supabase = await createClient();
    const { data: row, error } = await supabase
      .from("company_profiles")
      .select(
        "id, employer_id, company_name, industry, company_size, logo_url, company_bio, website_url"
      )
      .eq("id", companyId)
      .maybeSingle();

    if (error || !row) return null;

    const { data: jobsData } = await supabase
      .from("job_posts")
      .select(
        "id, title, company_name, logo_url, employment_type, location, monthly_salary, hours_per_week, skills, created_at"
      )
      .eq("employer_id", row.employer_id)
      .eq("status", "Active")
      .order("created_at", { ascending: false });

    const jobs = (jobsData ?? [])
      .map(mapPublicJob)
      .filter((job): job is PublicJobListing => job !== null);

    if (jobs.length === 0) return null;

    return {
      company: {
        id: row.id,
        employerId: row.employer_id,
        companyName: row.company_name,
        industry: row.industry,
        companySize: row.company_size,
        logoUrl: row.logo_url,
        companyBio: row.company_bio,
        websiteUrl: row.website_url,
        activeJobCount: jobs.length,
      },
      jobs,
    };
  } catch (err) {
    safeError("getPublicCompanyById:", err);
    return null;
  }
}
