import { createAdminClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";

/**
 * Claim a Resend/Svix webhook delivery id so retries are no-ops.
 * Returns "duplicate" when the same svix-id was already processed.
 */
export async function claimResendWebhookEvent(
  svixId: string,
  eventType: string
): Promise<"claimed" | "duplicate"> {
  const supabase = await createAdminClient();

  const { error } = await supabase.from("resend_webhook_events").insert({
    svix_id: svixId,
    event_type: eventType,
  });

  if (error?.code === "23505") {
    return "duplicate";
  }

  if (error) {
    safeError("claimResendWebhookEvent: insert failed", error);
    throw error;
  }

  return "claimed";
}

export async function releaseResendWebhookEvent(svixId: string): Promise<void> {
  const supabase = await createAdminClient();
  await supabase.from("resend_webhook_events").delete().eq("svix_id", svixId);
}
