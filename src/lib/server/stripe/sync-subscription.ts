import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import {
  getDiscoveryPlan,
  resolveBillingPlan,
  resolveBillingPlanByStripePriceId,
} from "@/lib/server/stripe/plan";
import { safeError, safeLog } from "@/utils/logger";
import { syncResendContactForUser } from "@/lib/server/resend/contact-sync";
import { invalidateEmployerCache } from "@/lib/server/entitlements";
import { extractSubscriptionPrice } from "@/lib/server/stripe/subscription-price";

function stripeTimestampToIso(value: number | null | undefined): string | null {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status
): string {
  switch (status) {
    case "active":
    case "trialing":
    case "past_due":
    case "canceled":
    case "unpaid":
      return status;
    case "incomplete":
    case "incomplete_expired":
      return "inactive";
    case "paused":
      return "inactive";
    default:
      return "inactive";
  }
}

async function resetEmployerUsageForNewPeriod(employerId: string): Promise<void> {
  const supabase = await createAdminClient();
  const now = new Date().toISOString();

  await Promise.all([
    supabase
      .from("employer_subscriptions")
      .update({
        job_posts_used: 0,
        unlocks_used: 0,
        updated_at: now,
      })
      .eq("employer_id", employerId),
    supabase.from("employer_plan_usage").upsert(
      {
        employer_id: employerId,
        active_jobs_count: 0,
        period_applicants_received: 0,
        period_messages_sent: 0,
        computed_at: now,
      },
      { onConflict: "employer_id" }
    ),
  ]);
}

async function resolvePlanForSubscription(
  subscription: Stripe.Subscription
): Promise<{ id: string; slug: string } | null> {
  const metadata = subscription.metadata ?? {};
  const planId = metadata.plan_id;
  const planSlug = metadata.plan_slug;

  if (planId) {
    const plan = await resolveBillingPlan(planId);
    if (plan) {
      return { id: plan.id, slug: plan.slug ?? planSlug ?? "discovery" };
    }
  }

  if (planSlug) {
    const plan = await resolveBillingPlan(planSlug);
    if (plan) {
      return { id: plan.id, slug: plan.slug ?? planSlug };
    }
  }

  const priceId = subscription.items.data[0]?.price?.id;
  if (priceId) {
    const plan = await resolveBillingPlanByStripePriceId(priceId);
    if (plan) {
      return { id: plan.id, slug: plan.slug ?? "discovery" };
    }
  }

  return null;
}

export type SyncSubscriptionInput = {
  employerId: string;
  planId: string;
  stripeCustomerId?: string | null;
  paymentIntentId?: string;
};

/**
 * Legacy PaymentIntent activation — kept for in-flight one-time checkouts.
 * Subscription billing uses syncEmployerSubscriptionFromStripe instead.
 */
export async function syncEmployerSubscription(
  input: SyncSubscriptionInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient();

  if (input.paymentIntentId) {
    const { data: existing } = await supabase
      .from("stripe_webhook_events")
      .select("event_id")
      .eq("event_id", `pi_${input.paymentIntentId}`)
      .maybeSingle();

    if (existing) {
      safeLog(
        `[Stripe] Skipping duplicate payment_intent ${input.paymentIntentId}`
      );
      return { success: true };
    }
  }

  const plan = await resolveBillingPlan(input.planId);

  if (!plan) {
    safeError("syncEmployerSubscription: plan not found", input.planId);
    return { success: false, error: "Plan not found." };
  }

  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { error: subError } = await supabase.from("employer_subscriptions").upsert(
    {
      employer_id: input.employerId,
      plan_id: plan.id,
      plan_slug: plan.slug ?? "discovery",
      status: "active",
      current_period_end: periodEnd,
      billing_period_end: periodEnd,
      unlocks_used: 0,
      stripe_customer_id: input.stripeCustomerId ?? undefined,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "employer_id" }
  );

  if (subError) {
    safeError("syncEmployerSubscription: subscription upsert failed", subError);
    return { success: false, error: "Failed to update subscription." };
  }

  if (input.paymentIntentId) {
    await supabase.from("stripe_webhook_events").insert({
      event_id: `pi_${input.paymentIntentId}`,
      type: "payment_intent.succeeded",
    });
  }

  safeLog(
    `[Stripe] Legacy PI subscription synced for employer [REDACTED] plan=${plan.slug}`
  );

  await invalidateEmployerCache(input.employerId);

  return { success: true };
}

export async function syncEmployerSubscriptionFromStripe(
  subscription: Stripe.Subscription,
  stripeEventId?: string
): Promise<{ success: boolean; error?: string }> {
  const employerId = subscription.metadata?.employer_id;

  if (!employerId) {
    safeError("syncEmployerSubscriptionFromStripe: missing employer_id metadata");
    return { success: false, error: "Missing employer metadata." };
  }

  const supabase = await createAdminClient();

  if (subscription.status === "canceled") {
    return downgradeEmployerToDiscovery(employerId, stripeEventId);
  }

  const resolved = await resolvePlanForSubscription(subscription);
  if (!resolved) {
    safeError(
      "syncEmployerSubscriptionFromStripe: could not resolve plan",
      subscription.id
    );
    return { success: false, error: "Plan not found for subscription." };
  }

  const planId = resolved.id;
  const planSlug = resolved.slug;

  const periodFields = subscription as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
  };
  const periodStart = stripeTimestampToIso(periodFields.current_period_start);
  const periodEnd = stripeTimestampToIso(periodFields.current_period_end);
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id ?? null;

  const status = mapStripeSubscriptionStatus(subscription.status);
  const { unitAmountCents, billingInterval } = extractSubscriptionPrice(subscription);

  const { data: existing } = await supabase
    .from("employer_subscriptions")
    .select("billing_period_start")
    .eq("employer_id", employerId)
    .maybeSingle();

  const periodRolled =
    periodStart &&
    existing?.billing_period_start &&
    existing.billing_period_start !== periodStart;

  const { error: subError } = await supabase.from("employer_subscriptions").upsert(
    {
      employer_id: employerId,
      plan_id: planId,
      plan_slug: planSlug,
      status,
      stripe_customer_id: customerId ?? undefined,
      stripe_subscription_id: subscription.id,
      billing_period_start: periodStart,
      billing_period_end: periodEnd,
      current_period_end: periodEnd,
      cancel_at_period_end: subscription.cancel_at_period_end,
      trial_end: stripeTimestampToIso(subscription.trial_end),
      last_stripe_event_id: stripeEventId ?? null,
      unit_amount_cents: unitAmountCents,
      billing_interval: billingInterval,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "employer_id" }
  );

  if (subError) {
    safeError(
      "syncEmployerSubscriptionFromStripe: subscription upsert failed",
      subError
    );
    return { success: false, error: "Failed to update subscription." };
  }

  if (periodRolled) {
    await resetEmployerUsageForNewPeriod(employerId);
  }

  safeLog(
    `[Stripe] Subscription synced employer=[REDACTED] plan=${planSlug} status=${status}`
  );

  await invalidateEmployerCache(employerId);

  // Resend contact sync (tier/segments) for broadcasts.
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name, role")
      .eq("id", employerId)
      .maybeSingle();

    if (profile?.email) {
      await syncResendContactForUser({
        userId: employerId,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: "employer",
        tierSlug: (planSlug ?? "discovery") as any,
        companyName: null,
      });
    }
  } catch (err) {
    safeError("syncEmployerSubscriptionFromStripe: resend sync failed", err);
  }

  return { success: true };
}

export async function downgradeEmployerToDiscovery(
  employerId: string,
  stripeEventId?: string
): Promise<{ success: boolean; error?: string }> {
  const discovery = await getDiscoveryPlan();
  if (!discovery) {
    return { success: false, error: "Discovery plan not found." };
  }

  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("employer_subscriptions")
    .update({
      plan_id: discovery.id,
      plan_slug: discovery.slug ?? "discovery",
      status: "canceled",
      stripe_subscription_id: null,
      cancel_at_period_end: false,
      last_stripe_event_id: stripeEventId ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("employer_id", employerId);

  if (error) {
    safeError("downgradeEmployerToDiscovery failed", error);
    return { success: false, error: "Failed to downgrade subscription." };
  }

  await invalidateEmployerCache(employerId);

  return { success: true };
}

export async function isEmployerSubscriptionActive(
  employerId: string
): Promise<boolean> {
  const supabase = await createAdminClient();
  const { data } = await supabase
    .from("employer_subscriptions")
    .select("status")
    .eq("employer_id", employerId)
    .maybeSingle();

  return data?.status === "active" || data?.status === "trialing";
}
