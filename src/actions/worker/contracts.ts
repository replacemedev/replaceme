"use server";

import { revalidatePath } from "next/cache";
import { requireWorker } from "@/lib/server/auth/worker";
import {
  contractResponseSchema,
  type WorkerContractRow,
} from "@/lib/validations/worker/phase2";

export async function getWorkerContracts(): Promise<WorkerContractRow[]> {
  const ctx = await requireWorker();
  if (!ctx) return [];

  const { data } = await ctx.supabase
    .from("contracts")
    .select(
      `
      id,
      employer_id,
      hourly_rate,
      weekly_hours,
      status,
      start_date,
      employment_type,
      job_id,
      job_posts ( title, company_name )
    `
    )
    .eq("worker_id", ctx.profile.id)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => {
    const job = Array.isArray(row.job_posts) ? row.job_posts[0] : row.job_posts;

    return {
      id: row.id,
      employerId: row.employer_id,
      companyName: job?.company_name ?? "Employer",
      jobTitle: job?.title ?? null,
      hourlyRate: Number(row.hourly_rate),
      weeklyHours: Number(row.weekly_hours),
      status: row.status,
      startDate: row.start_date,
      employmentType: row.employment_type,
    };
  });
}

export async function respondToContractOffer(payload: unknown) {
  const ctx = await requireWorker();
  if (!ctx) return { error: "Unauthorized" };

  const parsed = contractResponseSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid request" };
  }

  const nextStatus = parsed.data.action === "accept" ? "active" : "declined";

  const { error } = await ctx.supabase
    .from("contracts")
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", parsed.data.contractId)
    .eq("worker_id", ctx.profile.id)
    .eq("status", "offered");

  if (error) return { error: "Failed to update contract offer" };

  revalidatePath("/worker/contracts");
  return { success: true };
}
