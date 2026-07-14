import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import {
  getDiscoveryPlan,
  resolveBillingPlan,
  resolveBillingPlanByStripePriceId,
  resolveBillingPlanByStripeProductId,
} from "@/lib/server/stripe/plan";
import { getStripe } from "@/lib/server/stripe/client";
import { safeError, safeLog } from "@/utils/logger";
import { syncResendContactForUser } from "@/lib/server/resend/contact-sync";
import { invalidateEmployerCache } from "@/lib/server/entitlements";
import { extractSubscriptionPrice } from "@/lib/server/stripe/subscription-price";

export type SyncMetaOverrides = {
  employer_id?: string;
  plan_id?: string;
  plan_slug?: string;
};

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
    case "incomplete":
      return status;
    case "incomplete_expired":
    case "paused":
      return "inactive";
    default:
      return "inactive";
  }
}

function priceIdOf(subscription: Stripe.Subscription): string | null {
  const price = subscription.items.data[0]?.price;
  if (!price) return null;
  return typeof price === "string" ? price : price.id;
}

function productIdOf(subscription: Stripe.Subscription): string | null {
  const price = subscription.items.data[0]?.price;
  if (!price || typeof price === "string") return null;
  const product = price.product;
  if (!product) return null;
  return typeof product === "string" ? product : product.id;
}

/**
 * Live Stripe price is source of truth.
 * Metadata plan_slug/plan_id are stale after Customer Portal upgrades.
 */
async function resolvePlanForSubscription(
  subscription: Stripe.Subscription,
  overrides?: SyncMetaOverrides
): Promise<{ id: string; slug: string } | null> {
  const priceId = priceIdOf(subscription);
  if (priceId) {
    const byPrice = await resolveBillingPlanByStripePriceId(priceId);
    if (byPrice) {
      safeLog(
        `[Stripe] Plan resolved by price_id=${priceId} → ${byPrice.slug}`
      );
      return { id: byPrice.id, slug: byPrice.slug ?? "discovery" };
    }
  }

  const productId = productIdOf(subscription);
  if (productId) {
    const byProduct = await resolveBillingPlanByStripeProductId(productId);
    if (byProduct) {
      safeLog(
        `[Stripe] Plan resolved by product_id=${productId} → ${byProduct.slug}`
      );
      return { id: byProduct.id, slug: byProduct.slug ?? "discovery" };
    }
  }

  // Fallbacks only when price/product not mapped in billing_plans
  const planId = overrides?.plan_id || subscription.metadata?.plan_id;
  if (planId) {
    const plan = await resolveBillingPlan(planId);
    if (plan) {
      return { id: plan.id, slug: plan.slug ?? "discovery" };
    }
  }

  const planSlug = overrides?.plan_slug || subscription.metadata?.plan_slug;
  if (planSlug) {
    const plan = await resolveBillingPlan(planSlug);
    if (plan) {
      return { id: plan.id, slug: plan.slug ?? planSlug };
    }
  }

  safeError("[Stripe] resolvePlanForSubscription: no mapping", {
    priceId,
    productId,
    metadata: subscription.metadata,
  });
  return null;
}

async function resolveEmployerId(
  subscription: Stripe.Subscription,
  overrides?: SyncMetaOverrides
): Promise<string | null> {
  const fromOverride = overrides?.employer_id?.trim();
  if (fromOverride) return fromOverride;

  const fromMeta = subscription.metadata?.employer_id?.trim();
  if (fromMeta) return fromMeta;

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  if (!customerId) return null;

  const supabase = await createAdminClient();
  const { data: byCustomer } = await supabase
    .from("employer_subscriptions")
    .select("employer_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (byCustomer?.employer_id) return byCustomer.employer_id;

  // Stripe customer.metadata.employer_id (set in ensureStripeCustomer)
  const stripe = getStripe();
  if (!stripe) return null;

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer && !customer.deleted) {
      const eid = customer.metadata?.employer_id?.trim();
      if (eid) return eid;
    }
  } catch (err) {
    safeError("[Stripe] customer retrieve for employer_id failed", err);
  }

  return null;
}

/**
 * Keep Stripe subscription metadata aligned after Portal price switches.
 * Non-fatal — DB sync already succeeded.
 */
async function repairSubscriptionMetadata(
  subscription: Stripe.Subscription,
  employerId: string,
  plan: { id: string; slug: string }
): Promise<void> {
  const stripe = getStripe();
  if (!stripe) return;

  const current = subscription.metadata ?? {};
  if (
    current.employer_id === employerId &&
    current.plan_id === plan.id &&
    current.plan_slug === plan.slug
  ) {
    return;
  }

  try {
    await stripe.subscriptions.update(subscription.id, {
      metadata: {
        ...current,
        employer_id: employerId,
        plan_id: plan.id,
        plan_slug: plan.slug,
        // Clear stale schedule marker once live price matches entitlements
        scheduled_plan_slug: "",
      },
    });
    safeLog(
      `[Stripe] Repaired subscription metadata sub=${subscription.id} plan=${plan.slug}`
    );
  } catch (err) {
    safeError("[Stripe] metadata repair failed (non-fatal)", err);
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
  stripeEventId?: string,
  stripeEventCreated?: number,
  overrides?: SyncMetaOverrides
): Promise<{ success: boolean; error?: string }> {
  const employerId = await resolveEmployerId(subscription, overrides);

  if (!employerId) {
    safeError(
      "syncEmployerSubscriptionFromStripe: missing employer_id (metadata, customer, and DB lookup all failed)",
      { subscriptionId: subscription.id }
    );
    return { success: false, error: "Missing employer metadata." };
  }

  const supabase = await createAdminClient();

  // 2026: ignore stale deliveries — Stripe does not guarantee event order.
  if (stripeEventCreated != null) {
    const { data: existingGuard } = await supabase
      .from("employer_subscriptions")
      .select("last_stripe_event_created")
      .eq("employer_id", employerId)
      .maybeSingle();

    if (
      existingGuard?.last_stripe_event_created != null &&
      stripeEventCreated < existingGuard.last_stripe_event_created
    ) {
      safeLog(
        `[Stripe] Skipping stale event ${stripeEventId ?? "?"} (created=${stripeEventCreated} < ${existingGuard.last_stripe_event_created})`
      );
      return { success: true };
    }
  }

  // incomplete_expired = checkout abandoned within ~23h — revoke paid access.
  if (
    subscription.status === "canceled" ||
    subscription.status === "incomplete_expired"
  ) {
    return downgradeEmployerToDiscovery(
      employerId,
      stripeEventId,
      stripeEventCreated
    );
  }

  const resolved = await resolvePlanForSubscription(subscription, overrides);
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

  // Prefer live resolved slug over stale scheduled_* metadata from Portal upgrades.
  const scheduledFromMeta = subscription.metadata?.scheduled_plan_slug?.trim() || null;
  const liveSlug = (planSlug ?? "").toLowerCase();
  const scheduleCleared =
    !scheduledFromMeta ||
    (scheduledFromMeta && liveSlug === scheduledFromMeta.toLowerCase());

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
      last_stripe_event_created: stripeEventCreated ?? null,
      unit_amount_cents: unitAmountCents,
      billing_interval: billingInterval,
      ...(scheduleCleared
        ? { scheduled_plan_slug: null, scheduled_effective_at: null }
        : {
            scheduled_plan_slug: scheduledFromMeta,
          }),
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
    `[Stripe] Subscription synced employer=[REDACTED] plan=${planSlug} status=${status} price=${priceIdOf(subscription)}`
  );

  await invalidateEmployerCache(employerId);
  await repairSubscriptionMetadata(subscription, employerId, resolved);

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
  stripeEventId?: string,
  stripeEventCreated?: number
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
      scheduled_plan_slug: null,
      scheduled_effective_at: null,
      last_stripe_event_id: stripeEventId ?? null,
      last_stripe_event_created: stripeEventCreated ?? null,
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

/**
 * Pull live Stripe subscription for an employer and project to DB.
 * Same path as webhooks — safe to run in sandbox when a webhook was missed.
 */
export async function reconcileEmployerSubscriptionFromStripe(
  employerId: string
): Promise<{ success: boolean; planSlug?: string; error?: string }> {
  const stripe = getStripe();
  if (!stripe) {
    return { success: false, error: "Stripe is not configured." };
  }

  const supabase = await createAdminClient();
  const { data: row } = await supabase
    .from("employer_subscriptions")
    .select("stripe_customer_id, stripe_subscription_id")
    .eq("employer_id", employerId)
    .maybeSingle();

  let subscription: Stripe.Subscription | null = null;

  if (row?.stripe_subscription_id) {
    try {
      subscription = await stripe.subscriptions.retrieve(
        row.stripe_subscription_id,
        { expand: ["items.data.price"] }
      );
    } catch (err) {
      safeError("[Stripe] reconcile: retrieve by subscription id failed", err);
    }
  }

  if (
    (!subscription ||
      subscription.status === "canceled" ||
      subscription.status === "incomplete_expired") &&
    row?.stripe_customer_id
  ) {
    const listed = await stripe.subscriptions.list({
      customer: row.stripe_customer_id,
      status: "all",
      limit: 10,
      expand: ["data.items.data.price"],
    });
    subscription =
      listed.data.find((s) =>
        ["active", "trialing", "past_due", "incomplete"].includes(s.status)
      ) ??
      listed.data[0] ??
      null;
  }

  if (!subscription) {
    return {
      success: false,
      error: "No Stripe subscription found for this account.",
    };
  }

  const result = await syncEmployerSubscriptionFromStripe(subscription, undefined, undefined, {
    employer_id: employerId,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  const { data: updated } = await supabase
    .from("employer_subscriptions")
    .select("plan_slug")
    .eq("employer_id", employerId)
    .maybeSingle();

  return { success: true, planSlug: updated?.plan_slug ?? undefined };
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
