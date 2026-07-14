import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { recordBillingLedgerEvent } from "@/lib/server/stripe/billing-ledger";
import { getStripe } from "@/lib/server/stripe/client";
import { downgradeEmployerToDiscovery } from "@/lib/server/stripe/sync-subscription";
import { invalidateEmployerCache } from "@/lib/server/entitlements";
import { safeError, safeLog } from "@/utils/logger";

async function resolveEmployerIdFromCustomer(
  customerId: string | null | undefined
): Promise<string | null> {
  if (!customerId) return null;
  const supabase = await createAdminClient();
  const { data } = await supabase
    .from("employer_subscriptions")
    .select("employer_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.employer_id ?? null;
}

async function resolveCustomerIdFromDispute(
  dispute: Stripe.Dispute
): Promise<string | null> {
  if (dispute.metadata?.employer_id) {
    return null; // resolved via metadata below
  }

  const chargeRef = dispute.charge;
  if (typeof chargeRef === "object" && chargeRef && "customer" in chargeRef) {
    const c = chargeRef.customer;
    return typeof c === "string" ? c : c?.id ?? null;
  }

  if (typeof chargeRef === "string") {
    const stripe = getStripe();
    if (!stripe) return null;
    try {
      const charge = await stripe.charges.retrieve(chargeRef);
      return typeof charge.customer === "string"
        ? charge.customer
        : charge.customer?.id ?? null;
    } catch (err) {
      safeError("[Billing] dispute: charge retrieve failed", err);
      return null;
    }
  }

  return null;
}

/**
 * charge.dispute.* — flag account; revoke premium when dispute is lost.
 * @see https://docs.stripe.com/disputes
 */
export async function handleChargeDispute(
  dispute: Stripe.Dispute,
  eventType: string,
  stripeEventId: string,
  stripeEventCreated?: number
): Promise<void> {
  const employerIdFromMeta = dispute.metadata?.employer_id?.trim() || null;
  const customerId = await resolveCustomerIdFromDispute(dispute);
  const employerId =
    employerIdFromMeta ?? (await resolveEmployerIdFromCustomer(customerId));

  if (!employerId) {
    safeError("[Billing] dispute: could not resolve employer", {
      disputeId: dispute.id,
      eventType,
    });
    return;
  }

  const status = dispute.status;
  const now = new Date().toISOString();
  const supabase = await createAdminClient();

  await supabase
    .from("employer_subscriptions")
    .update({
      stripe_dispute_status: status,
      stripe_dispute_id: dispute.id,
      last_stripe_event_id: stripeEventId,
      last_stripe_event_created: stripeEventCreated ?? null,
      updated_at: now,
    })
    .eq("employer_id", employerId);

  await recordBillingLedgerEvent({
    employerId,
    stripeEventId,
    eventType,
    amountCents: dispute.amount ?? 0,
    currency: dispute.currency ?? "usd",
    subscriptionStatus: status,
    occurredAt: now,
  });

  await invalidateEmployerCache(employerId);

  if (
    eventType === "charge.dispute.closed" &&
    (status === "lost" || status === "warning_closed")
  ) {
    await downgradeEmployerToDiscovery(
      employerId,
      stripeEventId,
      stripeEventCreated
    );
    await supabase
      .from("employer_subscriptions")
      .update({
        stripe_dispute_status: status,
        stripe_dispute_id: dispute.id,
        updated_at: new Date().toISOString(),
      })
      .eq("employer_id", employerId);
  }

  safeLog(`[Billing] Dispute ${dispute.id} status=${status}`);
}
