"use server";

import { revalidatePath } from "next/cache";
import { requireWorker } from "@/lib/server/auth/worker";
import {
  jobAlertSchema,
  reportEmployerSchema,
  type WorkerJobAlertRow,
  type WorkerInterviewRow,
} from "@/lib/validations/worker/phase2";
import {
  CacheKeys,
  CACHE_TTL_SECONDS,
  cacheDel,
  getOrSet,
  invalidateWorkerCache,
} from "@/lib/server/redis-cache";

export async function getWorkerInterviews(): Promise<WorkerInterviewRow[]> {
  const ctx = await requireWorker();
  if (!ctx) return [];

  return getOrSet(
    CacheKeys.workerInterviews(ctx.profile.id),
    CACHE_TTL_SECONDS.workerInterviews,
    async () => {
      const { data } = await ctx.supabase
        .from("interviews")
        .select(
          `
          id,
          scheduled_at,
          meeting_link,
          status,
          application_id,
          applications!inner (
            id,
            status,
            job_posts ( title, company_name )
          )
        `
        )
        .eq("worker_id", ctx.profile.id)
        .in("status", ["SCHEDULED", "scheduled"])
        .order("scheduled_at", { ascending: true });

      return (data ?? []).map((row) => {
        const app = Array.isArray(row.applications)
          ? row.applications[0]
          : row.applications;
        const job = Array.isArray(app?.job_posts)
          ? app.job_posts[0]
          : app?.job_posts;

        return {
          interviewId: row.id,
          applicationId: row.application_id,
          jobTitle: job?.title ?? "Interview",
          companyName: job?.company_name ?? "Employer",
          scheduledAt: row.scheduled_at,
          meetingUrl: row.meeting_link,
          status: row.status,
        };
      });
    }
  );
}

export async function getWorkerJobAlerts(): Promise<WorkerJobAlertRow[]> {
  const ctx = await requireWorker();
  if (!ctx) return [];

  return getOrSet(
    CacheKeys.workerJobAlerts(ctx.profile.id),
    CACHE_TTL_SECONDS.workerJobAlerts,
    async () => {
      const { data } = await ctx.supabase
        .from("worker_job_alerts")
        .select("id, label, search_query, frequency, is_active, created_at")
        .eq("worker_id", ctx.profile.id)
        .order("created_at", { ascending: false });

      return (data ?? []).map((row) => ({
        id: row.id,
        label: row.label,
        searchQuery: row.search_query,
        frequency: row.frequency,
        isActive: row.is_active,
        createdAt: row.created_at,
      }));
    }
  );
}

export async function createWorkerJobAlert(payload: unknown) {
  const ctx = await requireWorker();
  if (!ctx) return { error: "Unauthorized" };

  const parsed = jobAlertSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid alert" };
  }

  const { data, error } = await ctx.supabase
    .from("worker_job_alerts")
    .insert({
      worker_id: ctx.profile.id,
      label: parsed.data.label,
      search_query: parsed.data.searchQuery,
      frequency: parsed.data.frequency,
    })
    .select("id, label, search_query, frequency, is_active, created_at")
    .single();

  if (error || !data) return { error: "Failed to create job alert" };

  await cacheDel(CacheKeys.workerJobAlerts(ctx.profile.id));
  revalidatePath("/worker/job-alerts");

  const alert: WorkerJobAlertRow = {
    id: data.id,
    label: data.label,
    searchQuery: data.search_query,
    frequency: data.frequency,
    isActive: data.is_active,
    createdAt: data.created_at,
  };

  return { success: true, alert };
}

export async function toggleWorkerJobAlert(
  alertId: string,
  isActive: boolean
) {
  const ctx = await requireWorker();
  if (!ctx) return { error: "Unauthorized" };

  const { error } = await ctx.supabase
    .from("worker_job_alerts")
    .update({ is_active: isActive })
    .eq("id", alertId)
    .eq("worker_id", ctx.profile.id);

  if (error) return { error: "Failed to update alert" };

  await cacheDel(CacheKeys.workerJobAlerts(ctx.profile.id));
  revalidatePath("/worker/job-alerts");
  return { success: true };
}

export async function deleteWorkerJobAlert(alertId: string) {
  const ctx = await requireWorker();
  if (!ctx) return { error: "Unauthorized" };

  const { error } = await ctx.supabase
    .from("worker_job_alerts")
    .delete()
    .eq("id", alertId)
    .eq("worker_id", ctx.profile.id);

  if (error) return { error: "Failed to delete alert" };

  await cacheDel(CacheKeys.workerJobAlerts(ctx.profile.id));
  revalidatePath("/worker/job-alerts");
  return { success: true };
}

export async function reportEmployer(payload: unknown) {
  const ctx = await requireWorker();
  if (!ctx) return { error: "Unauthorized" };

  const parsed = reportEmployerSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid report" };
  }

  const { error } = await ctx.supabase.from("disputes").insert({
    title: parsed.data.title,
    description: parsed.data.description,
    worker_id: ctx.profile.id,
    employer_id: parsed.data.employerId ?? null,
    job_id: parsed.data.jobId ?? null,
    status: "open",
  });

  if (error) return { error: "Failed to submit report" };

  revalidatePath("/worker/settings");
  return { success: true };
}

export async function getWorkerEarnings() {
  const ctx = await requireWorker();
  if (!ctx) return [];

  return getOrSet(
    CacheKeys.workerEarnings(ctx.profile.id),
    CACHE_TTL_SECONDS.workerEarnings,
    async () => {
      const { data } = await ctx.supabase
        .from("earnings_overview")
        .select("id, month_name, amount, is_highlighted")
        .eq("worker_id", ctx.profile.id)
        .order("created_at", { ascending: true });

      return data ?? [];
    }
  );
}
