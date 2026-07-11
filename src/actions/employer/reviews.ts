"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/server/auth/session";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { uuidSchema } from "@/lib/validations/common";
import { assertEmployerCanReview } from "@/lib/server/entitlements";
import { formatFullName } from "@/lib/format/name";

const submitReviewSchema = z
  .object({
    workerId: uuidSchema,
    rating: z.number().min(1).max(5),
    reviewText: z.string().min(10).max(2000),
  })
  .strict();

export interface ReviewableWorker {
  workerId: string;
  workerName: string;
  contractId: string;
  hasReview: boolean;
}

export async function getReviewableWorkers(): Promise<ReviewableWorker[]> {
  const { supabase, profile } = await requireRole("employer");

  const { data: contracts } = await supabase
    .from("contracts")
    .select(
      `
      id,
      worker_id,
      status,
      profiles!contracts_worker_id_fkey ( first_name, middle_name, last_name )
    `
    )
    .eq("employer_id", profile.id)
    .in("status", ["active", "terminated"]);

  const { data: existing } = await supabase
    .from("employer_testimonials")
    .select("worker_id")
    .eq("employer_id", profile.id);

  const reviewed = new Set((existing ?? []).map((r) => r.worker_id));

  return (contracts ?? []).map((c) => {
    const worker = c.profiles as { first_name?: string; middle_name?: string; last_name?: string } | null;
    return {
      workerId: c.worker_id,
      workerName:
        formatFullName(worker?.first_name, worker?.middle_name, worker?.last_name) || "Worker",
      contractId: c.id,
      hasReview: reviewed.has(c.worker_id),
    };
  });
}

export async function submitEmployerReview(payload: unknown) {
  const result = await runAction("submitEmployerReview", async () => {
    const parsed = submitReviewSchema.parse(payload);
    const { supabase, profile } = await requireRole("employer");

    const reviewCheck = await assertEmployerCanReview(profile.id);
    if (!reviewCheck.allowed) {
      return fail(reviewCheck.error);
    }

    const { data: contract } = await supabase
      .from("contracts")
      .select("id")
      .eq("employer_id", profile.id)
      .eq("worker_id", parsed.workerId)
      .in("status", ["active", "terminated"])
      .maybeSingle();

    if (!contract) {
      return fail("You can only review workers you have hired.");
    }

    const { data: existing } = await supabase
      .from("employer_testimonials")
      .select("id")
      .eq("employer_id", profile.id)
      .eq("worker_id", parsed.workerId)
      .maybeSingle();

    if (existing) {
      return fail("You have already reviewed this worker.");
    }

    const { error } = await supabase.from("employer_testimonials").insert({
      employer_id: profile.id,
      worker_id: parsed.workerId,
      rating: parsed.rating,
      review_text: parsed.reviewText,
    });

    if (error) return fail("Failed to save review.");

    revalidatePath("/employer/reviews");
    revalidatePath("/employer/hired");
    return ok();
  });

  return result.success ? { success: true } : { error: result.error };
}
