"use server";

import { revalidatePath } from "next/cache";
import { requireWorker } from "@/lib/server/auth/worker";
import {
  jobAlertSchema,
  reportEmployerSchema,
  type WorkerJobAlertRow,
  type SkillAssessmentRow,
  type WorkerInterviewRow,
} from "@/lib/validations/worker/phase2";

export async function getWorkerInterviews(): Promise<WorkerInterviewRow[]> {
  const ctx = await requireWorker();
  if (!ctx) return [];

  const { data } = await ctx.supabase
    .from("applications")
    .select(
      `
      id,
      status,
      created_at,
      job_posts ( title, company_name )
    `
    )
    .eq("candidate_id", ctx.profile.id)
    .eq("status", "INTERVIEW_SCHEDULED")
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => {
    const job = Array.isArray(row.job_posts) ? row.job_posts[0] : row.job_posts;
    return {
      applicationId: row.id,
      jobTitle: job?.title ?? "Interview",
      companyName: job?.company_name ?? "Employer",
      scheduledAt: row.created_at,
      status: row.status,
    };
  });
}

export async function getSkillAssessments(): Promise<SkillAssessmentRow[]> {
  const ctx = await requireWorker();
  if (!ctx) return [];

  const { data } = await ctx.supabase
    .from("skill_assessments")
    .select("id, title, description, skill_name, duration_minutes")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    skillName: row.skill_name,
    durationMinutes: row.duration_minutes,
  }));
}

export async function getWorkerJobAlerts(): Promise<WorkerJobAlertRow[]> {
  const ctx = await requireWorker();
  if (!ctx) return [];

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

export async function createWorkerJobAlert(payload: unknown) {
  const ctx = await requireWorker();
  if (!ctx) return { error: "Unauthorized" };

  const parsed = jobAlertSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid alert" };
  }

  const { error } = await ctx.supabase.from("worker_job_alerts").insert({
    worker_id: ctx.profile.id,
    label: parsed.data.label,
    search_query: parsed.data.searchQuery,
    frequency: parsed.data.frequency,
  });

  if (error) return { error: "Failed to create job alert" };

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

  const { data } = await ctx.supabase
    .from("earnings_overview")
    .select("id, month_name, amount, is_highlighted")
    .eq("worker_id", ctx.profile.id)
    .order("created_at", { ascending: true });

  return data ?? [];
}
