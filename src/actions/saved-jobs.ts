"use server";

import { createClient } from "@/lib/supabase/server";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { requireRole } from "@/lib/server/auth/session";
import { uuidSchema } from "@/lib/validations/common";
import { safeError } from "@/utils/logger";
import { revalidatePath } from "next/cache";
import { computeJobHourlyRate } from "@/types/job-search";
import {
  SavedJob,
  SavedJobsQuery,
  filterSavedJobs,
  sortSavedJobs,
} from "@/types/saved-jobs";
import {
  CacheKeys,
  CACHE_TTL_SECONDS,
  getOrSet,
  invalidateWorkerCache,
} from "@/lib/server/redis-cache";

type JobPostEmbed = {
  id: string;
  title: string;
  company_name: string | null;
  logo_url: string | null;
  employment_type: string | null;
  monthly_salary: number | null;
  salary_currency: string | null;
  hours_per_week: number | null;
  location: string | null;
  status: string | null;
};

type SavedJobRow = {
  id: string;
  created_at: string;
  job_id: string;
  job_posts: JobPostEmbed | JobPostEmbed[] | null;
};

function resolveJobPost(
  embed: JobPostEmbed | JobPostEmbed[] | null | undefined
): JobPostEmbed | null {
  if (!embed) return null;
  return Array.isArray(embed) ? embed[0] ?? null : embed;
}

function mapSavedJobRow(
  row: SavedJobRow,
  appliedJobIds: Set<string>
): SavedJob | null {
  const post = resolveJobPost(row.job_posts);
  if (!post?.id || !post.title || post.status !== "Active") return null;

  const monthlySalary = Number(post.monthly_salary ?? 0);
  const salaryCurrency = post.salary_currency ?? "PHP";
  const hoursPerWeek = Number(post.hours_per_week ?? 0);

  return {
    savedId: row.id,
    savedAt: row.created_at,
    id: post.id,
    title: post.title,
    companyName: post.company_name ?? "Unknown Company",
    companyLogoUrl: post.logo_url ?? null,
    employmentType: post.employment_type ?? "Any",
    monthlySalary,
    salaryCurrency,
    hoursPerWeek,
    hourlyRate: computeJobHourlyRate(monthlySalary, hoursPerWeek),
    location: post.location ?? "Remote",
    status: post.status,
    hasApplied: appliedJobIds.has(post.id),
  };
}

async function loadSavedJobsForWorker(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workerId: string
): Promise<SavedJob[]> {
  const { data: rows, error } = await supabase
    .from("worker_saved_jobs")
    .select(
      `
        id,
        created_at,
        job_id,
        job_posts!inner (
          id,
          title,
          company_name,
          logo_url,
          employment_type,
          monthly_salary,
          salary_currency,
          hours_per_week,
          location,
          status
        )
      `
    )
    .eq("worker_id", workerId)
    .eq("job_posts.status", "Active");

  if (error) {
    safeError("getSavedJobs:", error);
    return [];
  }

  const jobIds = (rows ?? [])
    .map((r) => resolveJobPost((r as SavedJobRow).job_posts)?.id)
    .filter((id): id is string => Boolean(id));

  let appliedJobIds = new Set<string>();
  if (jobIds.length > 0) {
    const { data: applications } = await supabase
      .from("applications")
      .select("job_id")
      .eq("candidate_id", workerId)
      .in("job_id", jobIds);

    appliedJobIds = new Set((applications ?? []).map((a) => a.job_id));
  }

  return (rows ?? [])
    .map((row) => mapSavedJobRow(row as SavedJobRow, appliedJobIds))
    .filter((j): j is SavedJob => j !== null);
}

/**
 * worker_saved_jobs → job_posts (jobs + company_profiles via view).
 * Inactive or deleted jobs are excluded (CASCADE removes deleted; inner Active filter).
 */
export async function getSavedJobs(
  query: SavedJobsQuery
): Promise<SavedJob[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "worker") return [];

    const saved = await getOrSet(
      CacheKeys.workerSavedJobs(profile.id),
      CACHE_TTL_SECONDS.savedJobs,
      () => loadSavedJobsForWorker(supabase, profile.id)
    );

    const filtered = filterSavedJobs(saved, query.q);
    return sortSavedJobs(filtered, query.sort);
  } catch (err) {
    safeError("getSavedJobs:", err);
    return [];
  }
}

export async function unsaveJob(
  jobId: string
): Promise<{ success: boolean; error?: string }> {
  const result = await runAction("unsaveJob", async () => {
    const parsed = uuidSchema.parse(jobId);
    const { supabase, profile } = await requireRole("worker");

    const { data: bookmark } = await supabase
      .from("worker_saved_jobs")
      .select("id, job_id")
      .eq("worker_id", profile.id)
      .eq("job_id", parsed)
      .maybeSingle();

    if (!bookmark) {
      return fail("Job is not in your saved list.");
    }

    const { error: deleteError } = await supabase
      .from("worker_saved_jobs")
      .delete()
      .eq("worker_id", profile.id)
      .eq("job_id", parsed);

    if (deleteError) {
      return fail("Failed to remove bookmark.");
    }

    await invalidateWorkerCache(profile.id);

    revalidatePath("/worker/saved-jobs");
    revalidatePath("/worker/jobs");
    revalidatePath(`/worker/jobs/${parsed}`);
    return ok();
  });

  return result.success
    ? { success: true }
    : { success: false, error: result.error };
}
