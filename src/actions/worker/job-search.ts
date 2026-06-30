"use server";

import { createClient } from "@/lib/supabase/server";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { requireRole } from "@/lib/server/auth/session";
import { uuidSchema } from "@/lib/validations/common";
import { safeError } from "@/utils/logger";
import { revalidatePath } from "next/cache";
import {
  EmploymentTypeFacet,
  JobSearchFacets,
  JobSearchPayload,
  JobSearchResult,
  computeJobHourlyRate,
} from "@/types/job-search";
import {
  CacheKeys,
  CACHE_TTL_SECONDS,
  getOrSet,
  invalidateWorkerCache,
} from "@/lib/server/redis-cache";

function mapJobRow(
  row: {
    id: string | null;
    employer_id: string | null;
    title: string | null;
    employment_type: string | null;
    description: string | null;
    monthly_salary: number | null;
    salary_currency?: string | null;
    hours_per_week: number | null;
    location: string | null;
    skills: string[] | null;
    created_at: string | null;
    priority_score?: number | null;
  },
  savedJobIds: Set<string>,
  companyByEmployer: Map<
    string,
    { company_name: string | null; logo_url: string | null }
  >
): JobSearchResult | null {
  if (!row.id || !row.title) return null;

  const company = row.employer_id
    ? companyByEmployer.get(row.employer_id)
    : undefined;
  const monthlySalary = Number(row.monthly_salary ?? 0);
  const salaryCurrency = row.salary_currency ?? "PHP";
  const hoursPerWeek = Number(row.hours_per_week ?? 0);

  return {
    id: row.id,
    employerId: row.employer_id ?? "",
    title: row.title,
    companyName: company?.company_name ?? "Unknown Company",
    companyLogoUrl: company?.logo_url ?? null,
    employmentType: row.employment_type ?? "Full-time",
    description: row.description ?? "",
    monthlySalary,
    salaryCurrency,
    hoursPerWeek,
    hourlyRate: computeJobHourlyRate(monthlySalary, hoursPerWeek),
    location: row.location ?? "Remote",
    skills: row.skills ?? [],
    createdAt: row.created_at ?? new Date().toISOString(),
    isSaved: savedJobIds.has(row.id),
    priorityScore: Number(row.priority_score ?? 0),
  };
}

function buildFacets(jobs: JobSearchResult[]): JobSearchFacets {
  const employmentMap = new Map<string, number>();
  const skillSet = new Set<string>();
  let salaryMin = 0;
  let salaryMax = 0;

  for (const job of jobs) {
    const type = job.employmentType;
    employmentMap.set(type, (employmentMap.get(type) ?? 0) + 1);
    for (const skill of job.skills) {
      if (skill.trim()) skillSet.add(skill.trim());
    }
    if (job.monthlySalary > salaryMax) salaryMax = job.monthlySalary;
  }

  const employmentTypes: EmploymentTypeFacet[] = Array.from(
    employmentMap,
    ([type, count]) => ({ type, count })
  ).sort((a, b) => b.count - a.count);

  const skillSuggestions = Array.from(skillSet).sort((a, b) =>
    a.localeCompare(b)
  );

  return {
    employmentTypes,
    skillSuggestions,
    salaryMin,
    salaryMax: Math.max(salaryMax, 200_000),
    totalActiveJobs: jobs.length,
  };
}

async function getWorkerSavedJobIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workerId: string
): Promise<Set<string>> {
  const { data } = await supabase
    .from("worker_saved_jobs")
    .select("job_id")
    .eq("worker_id", workerId);

  return new Set((data ?? []).map((r) => r.job_id));
}

/** Active job_posts joined to company_profiles — marketplace bridge. */
export async function getJobSearchData(): Promise<JobSearchPayload> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let workerId = "guest";
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.role === "worker") {
        workerId = profile.id;
      }
    }

    return getOrSet(
      CacheKeys.workerJobSearch(workerId),
      CACHE_TTL_SECONDS.jobSearch,
      async () => {
        let savedJobIds = new Set<string>();
        if (workerId !== "guest") {
          savedJobIds = await getWorkerSavedJobIds(supabase, workerId);
        }

        const { data, error } = await supabase
          .from("jobs")
          .select(
            `
        id,
        employer_id,
        title,
        employment_type,
        description,
        monthly_salary,
        salary_currency,
        hours_per_week,
        location,
        skills,
        created_at,
        priority_score
      `
          )
          .eq("status", "Active")
          .order("priority_score", { ascending: false })
          .order("created_at", { ascending: false });

        if (error) {
          safeError("getJobSearchData:", error);
          return {
            jobs: [],
            facets: {
              employmentTypes: [],
              skillSuggestions: [],
              salaryMin: 0,
              salaryMax: 200_000,
              totalActiveJobs: 0,
            },
            savedJobIds: [],
          };
        }

        const employerIds = [
          ...new Set(
            (data ?? [])
              .map((row) => row.employer_id)
              .filter((id): id is string => Boolean(id))
          ),
        ];

        const companyByEmployer = new Map<
          string,
          { company_name: string | null; logo_url: string | null }
        >();

        if (employerIds.length > 0) {
          const { data: companies } = await supabase
            .from("company_profiles")
            .select("employer_id, company_name, logo_url")
            .in("employer_id", employerIds);

          for (const company of companies ?? []) {
            companyByEmployer.set(company.employer_id, {
              company_name: company.company_name,
              logo_url: company.logo_url,
            });
          }
        }

        const jobs = (data ?? [])
          .map((row) => mapJobRow(row, savedJobIds, companyByEmployer))
          .filter((j): j is JobSearchResult => j !== null);

        return {
          jobs,
          facets: buildFacets(jobs),
          savedJobIds: Array.from(savedJobIds),
        };
      }
    );
  } catch (err) {
    safeError("getJobSearchData:", err);
    return {
      jobs: [],
      facets: {
        employmentTypes: [],
        skillSuggestions: [],
        salaryMin: 0,
        salaryMax: 200_000,
        totalActiveJobs: 0,
      },
      savedJobIds: [],
    };
  }
}

export async function toggleSavedJob(
  jobId: string
): Promise<{ success: boolean; saved: boolean; error?: string }> {
  const result = await runAction("toggleSavedJob", async () => {
    const parsed = uuidSchema.parse(jobId);
    const { supabase, profile } = await requireRole("worker");

    const { data: existing } = await supabase
      .from("worker_saved_jobs")
      .select("id")
      .eq("worker_id", profile.id)
      .eq("job_id", parsed)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("worker_saved_jobs")
        .delete()
        .eq("worker_id", profile.id)
        .eq("job_id", parsed);

      if (error) return fail("Failed to remove bookmark.");

      await invalidateWorkerCache(profile.id);

      revalidatePath("/worker/jobs");
      revalidatePath("/worker/saved-jobs");
      revalidatePath(`/worker/jobs/${parsed}`);
      return ok({ saved: false });
    }

    const { error } = await supabase.from("worker_saved_jobs").insert({
      worker_id: profile.id,
      job_id: parsed,
    });

    if (error) return fail("Failed to save job.");

    await invalidateWorkerCache(profile.id);

    revalidatePath("/worker/jobs");
    revalidatePath("/worker/saved-jobs");
    revalidatePath(`/worker/jobs/${parsed}`);
    return ok({ saved: true });
  });

  if (!result.success) {
    return { success: false, saved: false, error: result.error };
  }
  return { success: true, saved: result.data?.saved ?? false };
}
