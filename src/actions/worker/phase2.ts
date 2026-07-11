"use server";

import { revalidatePath } from "next/cache";
import { requireWorker } from "@/lib/server/auth/worker";
import {
  reportEmployerSchema,
  type WorkerInterviewRow,
} from "@/lib/validations/worker/phase2";
import {
  CacheKeys,
  CACHE_TTL_SECONDS,
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
      const { data, error } = await ctx.supabase
        .from("applications")
        .select(
          `
          id,
          status,
          created_at,
          job_posts ( title, company_name ),
          interviews (
            id,
            scheduled_at,
            meeting_link,
            status
          )
        `
        )
        .eq("candidate_id", ctx.profile.id)
        .eq("status", "INTERVIEW_SCHEDULED")
        .order("created_at", { ascending: false });

      if (error) {
        return [];
      }

      return (data ?? []).map((app: any) => {
        const job = Array.isArray(app.job_posts)
          ? app.job_posts[0]
          : app.job_posts;

        const interview = Array.isArray(app.interviews)
          ? app.interviews[0]
          : app.interviews;

        return {
          interviewId: interview?.id || app.id,
          applicationId: app.id,
          jobTitle: job?.title ?? "Interview",
          companyName: job?.company_name ?? "Employer",
          scheduledAt: interview?.scheduled_at || app.created_at,
          meetingUrl: interview?.meeting_link || null,
          status: interview?.status || "scheduled",
        };
      });
    }
  );
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
