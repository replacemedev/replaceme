"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/server/auth/session";
import { rateLimitReportSubmission } from "@/lib/server/rate-limit";
import { reportWorkerSchema } from "@/lib/validations/employer/report-worker";
import { safeError } from "@/utils/logger";

export async function reportWorker(payload: unknown) {
  try {
    const parsed = reportWorkerSchema.safeParse(payload);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid report" };
    }

    const ctx = await requireRole(["employer"]);
    const rate = await rateLimitReportSubmission(ctx.profile.id);
    if (!rate.success) return { error: rate.error };

    const { data: worker, error: workerError } = await ctx.supabase
      .from("profiles")
      .select("id, role")
      .eq("id", parsed.data.workerId)
      .eq("role", "worker")
      .maybeSingle();

    if (workerError || !worker) {
      return { error: "Worker account not found" };
    }

    if (worker.id === ctx.profile.id) {
      return { error: "You cannot report yourself" };
    }

    const { error } = await ctx.supabase.from("user_reports").insert({
      reporter_id: ctx.profile.id,
      reported_user_id: worker.id,
      job_id: parsed.data.jobId ?? null,
      violation_category: parsed.data.violationCategory,
      title: parsed.data.title,
      description: parsed.data.description,
      status: "open",
    });

    if (error) {
      safeError("reportWorker insert:", error);
      return { error: "Failed to submit report" };
    }

    revalidatePath("/employer/settings/account");
    revalidatePath("/admin/reports");
    return { success: true };
  } catch (err) {
    safeError("reportWorker:", err);
    return { error: "Unauthorized" };
  }
}
