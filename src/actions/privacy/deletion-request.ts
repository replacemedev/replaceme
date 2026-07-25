"use server";

import { z } from "zod";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { requireRole } from "@/lib/server/auth/session";
import {
  ACCOUNT_LIFECYCLE_TIMELINES,
  addCalendarDays,
} from "@/lib/data/legal";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const deletionRequestSchema = z
  .object({
    reason: z.string().max(1000).optional(),
  })
  .strict();

export async function submitDataDeletionRequest(input: unknown) {
  return runAction("submitDataDeletionRequest", async () => {
    const parsed = deletionRequestSchema.parse(input ?? {});
    const { supabase, user, profile } = await requireRole(["worker", "employer"]);

    const { data: existing } = await supabase
      .from("data_deletion_requests")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .maybeSingle();

    if (existing) {
      return fail("You already have a pending deletion request.");
    }

    const { error } = await supabase.from("data_deletion_requests").insert({
      user_id: user.id,
      role: profile.role,
      reason: parsed.reason?.trim() || null,
      status: "pending",
    });

    if (error) {
      return fail("Could not submit your deletion request. Please try again or email support.");
    }

    const deletionScheduledFor = addCalendarDays(
      new Date(),
      ACCOUNT_LIFECYCLE_TIMELINES.deletionGraceCalendarDays
    ).toISOString();

    const admin = await createAdminClient();
    const { error: scheduleError } = await admin
      .from("profiles")
      .update({ deletion_scheduled_for: deletionScheduledFor })
      .eq("id", user.id)
      .is("deleted_at", null);

    if (scheduleError) {
      return fail(
        "Deletion request was recorded but scheduling failed. Please contact support."
      );
    }

    revalidatePath("/worker/settings");
    revalidatePath("/employer/settings/account");
    return ok({
      message:
        "Deletion request submitted. We will confirm by email and process eligible erasure within our stated timelines.",
      scheduledFor: deletionScheduledFor,
    });
  });
}

export async function getLatestDeletionRequestStatus(): Promise<{
  status: string;
  createdAt: string;
  scheduledFor: string | null;
} | null> {
  try {
    const { supabase, user } = await requireRole(["worker", "employer"]);
    const [{ data }, { data: profile }] = await Promise.all([
      supabase
        .from("data_deletion_requests")
        .select("status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("deletion_scheduled_for")
        .eq("id", user.id)
        .maybeSingle(),
    ]);

    if (!data) return null;
    return {
      status: data.status,
      createdAt: data.created_at,
      scheduledFor: profile?.deletion_scheduled_for ?? null,
    };
  } catch {
    return null;
  }
}
