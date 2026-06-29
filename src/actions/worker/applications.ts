"use server";

import { createClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";
import {
  UNDER_REVIEW_STATUSES,
  WorkerApplication,
  WorkerApplicationStats,
  computeHourlyRate,
  ApplicationStatus,
  isApplicationStatus,
} from "@/types/applications";
import {
  CacheKeys,
  CACHE_TTL_SECONDS,
  getOrSet,
} from "@/lib/server/redis-cache";

type JobPostJoin = {
  id: string | null;
  title: string | null;
  company_name: string | null;
  logo_url: string | null;
  monthly_salary: number | null;
  hours_per_week: number | null;
};

function mapApplicationRow(row: {
  id: string;
  status: string;
  created_at: string;
  match_score: number;
  job_id: string;
  job_posts: JobPostJoin | JobPostJoin[] | null;
}): WorkerApplication | null {
  const job = Array.isArray(row.job_posts)
    ? row.job_posts[0]
    : row.job_posts;

  if (!job?.title) return null;

  const normalizedStatus: ApplicationStatus = isApplicationStatus(row.status)
    ? row.status
    : "PENDING";

  const monthlySalary = job.monthly_salary ?? 0;
  const hoursPerWeek = job.hours_per_week ?? 0;

  return {
    id: row.id,
    jobId: row.job_id,
    status: normalizedStatus,
    createdAt: row.created_at,
    matchScore: row.match_score,
    jobTitle: job.title,
    companyName: job.company_name ?? "Unknown Company",
    companyLogoUrl: job.logo_url ?? null,
    monthlySalary,
    hoursPerWeek,
    hourlyRate: computeHourlyRate(monthlySalary, hoursPerWeek),
  };
}

async function getAuthenticatedWorker() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "worker") return null;
  return { supabase, profile };
}

export async function getWorkerApplicationById(applicationId: string) {
  try {
    const ctx = await getAuthenticatedWorker();
    if (!ctx) return null;

    const { supabase, profile } = ctx;

    const { data, error } = await supabase
      .from("applications")
      .select(
        `
        id,
        status,
        created_at,
        match_score,
        job_id,
        job_posts (
          id,
          title,
          company_name,
          logo_url,
          monthly_salary,
          hours_per_week
        )
      `
      )
      .eq("id", applicationId)
      .eq("candidate_id", profile.id)
      .maybeSingle();

    if (error || !data) return null;
    return mapApplicationRow(data);
  } catch (err) {
    safeError("getWorkerApplicationById:", err);
    return null;
  }
}

/** applications → job_posts (jobs + company_profiles via view). */
export async function getWorkerApplications(): Promise<WorkerApplication[]> {
  try {
    const ctx = await getAuthenticatedWorker();
    if (!ctx) return [];

    const { supabase, profile } = ctx;

    return getOrSet(
      CacheKeys.workerApplications(profile.id),
      CACHE_TTL_SECONDS.workerApplications,
      async () => {
        const { data, error } = await supabase
          .from("applications")
          .select(
            `
        id,
        status,
        created_at,
        match_score,
        job_id,
        job_posts (
          id,
          title,
          company_name,
          logo_url,
          monthly_salary,
          hours_per_week
        )
      `
          )
          .eq("candidate_id", profile.id)
          .order("created_at", { ascending: false });

        if (error) {
          safeError("getWorkerApplications:", error);
          return [];
        }

        return (data ?? [])
          .map(mapApplicationRow)
          .filter((row): row is WorkerApplication => row !== null);
      }
    );
  } catch (err) {
    safeError("getWorkerApplications:", err);
    return [];
  }
}

export async function getWorkerApplicationStats(): Promise<WorkerApplicationStats> {
  try {
    const applications = await getWorkerApplications();
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const sentThisWeek = applications.filter(
      (a) => new Date(a.createdAt).getTime() >= weekAgo
    ).length;

    return {
      totalSent: applications.length,
      sentThisWeek,
      underReview: applications.filter((a) =>
        UNDER_REVIEW_STATUSES.includes(a.status)
      ).length,
      interviewsScheduled: applications.filter(
        (a) => a.status === "INTERVIEW_SCHEDULED"
      ).length,
    };
  } catch (err) {
    safeError("getWorkerApplicationStats:", err);
    return {
      totalSent: 0,
      sentThisWeek: 0,
      underReview: 0,
      interviewsScheduled: 0,
    };
  }
}
