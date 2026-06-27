import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";

export async function claimStripeWebhookEvent(
  event: Stripe.Event
): Promise<"claimed" | "duplicate"> {
  const supabase = await createAdminClient();

  const { error } = await supabase.from("stripe_webhook_events").insert({
    event_id: event.id,
    type: event.type,
  });

  if (error?.code === "23505") {
    return "duplicate";
  }

  if (error) {
    safeError("claimStripeWebhookEvent: insert failed", error);
    throw error;
  }

  return "claimed";
}

export async function releaseStripeWebhookEvent(eventId: string): Promise<void> {
  const supabase = await createAdminClient();
  await supabase.from("stripe_webhook_events").delete().eq("event_id", eventId);
}
