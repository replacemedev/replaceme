import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { requireStripe } from "@/lib/server/stripe/client";
import {
  resolveBillingPlan,
  resolveStripePriceIdFromEnv,
  type BillingPlanRow,
} from "@/lib/server/stripe/plan";
import { syncEmployerSubscriptionFromStripe } from "@/lib/server/stripe/sync-subscription";
import { safeError, safeLog } from "@/utils/logger";

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

function resolvePlanPriceId(plan: BillingPlanRow): string | null {
  return (
    plan.stripe_price_id ??
    resolveStripePriceIdFromEnv(plan.slug ?? "") ??
    null
  );
}

export type UpgradeSubscriptionResult =
  | { mode: "updated"; subscriptionId: string; planSlug: string }
  | { mode: "checkout_required" }
  | { error: string };

/**
 * Upgrade/downgrade an existing Stripe subscription in place.
 * Per Stripe docs: update the subscription *item* price — do not create a new
 * Checkout subscription (that creates a second concurrent subscription).
 * @see https://docs.stripe.com/billing/subscriptions/change-price
 */
export async function upgradeExistingSubscription(input: {
  employerId: string;
  planRef: string;
}): Promise<UpgradeSubscriptionResult> {
  const plan = await resolveBillingPlan(input.planRef);
  if (!plan) {
    return { error: "Billing plan not found." };
  }

  if (plan.slug === "discovery" || Number(plan.price) <= 0) {
    return { error: "Discovery is free — no paid upgrade required." };
  }

  const priceId = resolvePlanPriceId(plan);
  if (!priceId) {
    return {
      error:
        "This plan is missing a Stripe price ID. Configure stripe_price_id or STRIPE_PRICE_* env.",
    };
  }

  const supabase = await createAdminClient();
  const { data: row, error: rowError } = await supabase
    .from("employer_subscriptions")
    .select(
      "stripe_subscription_id, stripe_customer_id, status, plan_slug, cancel_at_period_end"
    )
    .eq("employer_id", input.employerId)
    .maybeSingle();

  if (rowError) {
    safeError("[Billing] Failed to load employer subscription", rowError);
    return { error: "Could not load your subscription. Please try again." };
  }

  const subscriptionId = row?.stripe_subscription_id?.trim() || null;
  const customerId = row?.stripe_customer_id?.trim() || null;

  // No tracked paid sub → first-time Checkout is allowed.
  if (!subscriptionId || !row?.status || !ACTIVE_STATUSES.has(row.status)) {
    return { mode: "checkout_required" };
  }

  // Defensive: never mutate Stripe without both tracking IDs from our DB.
  if (!customerId) {
    safeError(
      "[Billing] Refusing upgrade — active subscription missing stripe_customer_id",
      { employerId: input.employerId }
    );
    return {
      error:
        "Your billing account is missing a Stripe customer ID. Open Manage billing or contact support before changing plans.",
    };
  }

  const currentSlug = (row.plan_slug ?? "").toLowerCase();
  const targetSlug = (plan.slug ?? input.planRef).toLowerCase();
  if (currentSlug === targetSlug && !row.cancel_at_period_end) {
    return { error: "You are already on this plan." };
  }

  const stripe = requireStripe();

  let subscription: Stripe.Subscription;
  try {
    subscription = await stripe.subscriptions.retrieve(subscriptionId);
  } catch (err) {
    safeError("[Billing] Stripe retrieve subscription failed", err);
    return {
      error:
        "Could not find your Stripe subscription. Open Manage billing or contact support.",
    };
  }

  if (
    subscription.status === "canceled" ||
    subscription.status === "incomplete_expired"
  ) {
    return { mode: "checkout_required" };
  }

  const stripeCustomerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  if (!stripeCustomerId || stripeCustomerId !== customerId) {
    safeError(
      "[Billing] Refusing upgrade — DB customer_id does not match Stripe subscription",
      { trackedCustomer: customerId, stripeCustomer: stripeCustomerId }
    );
    return {
      error:
        "Billing records are out of sync. Open Manage billing or contact support before changing plans.",
    };
  }

  const item = subscription.items.data[0];
  if (!item?.id) {
    return {
      error:
        "Your Stripe subscription has no billable item. Contact support before upgrading.",
    };
  }

  // Defensive: refuse if Stripe already has another active/trialing sub (prior duplicate bug).
  const [activeSiblings, trialingSiblings] = await Promise.all([
    stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    }),
    stripe.subscriptions.list({
      customer: customerId,
      status: "trialing",
      limit: 10,
    }),
  ]);
  const extras = [...activeSiblings.data, ...trialingSiblings.data].filter(
    (s) => s.id !== subscriptionId
  );
  if (extras.length > 0) {
    safeError(
      `[Billing] Customer has ${extras.length} extra active subscription(s); refusing silent upgrade`,
      { tracked: subscriptionId, extras: extras.map((s) => s.id) }
    );
    return {
      error:
        "Multiple active Stripe subscriptions detected. Use Manage billing to cancel the duplicate, then try again.",
    };
  }

  const planSlug = plan.slug ?? targetSlug;

  try {
    // Stripe: must pass item id when changing price, or a second item is added.
    // create_prorations = credit unused time + charge new plan for remainder.
    const updated = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: item.id,
          price: priceId,
          quantity: item.quantity ?? 1,
        },
      ],
      proration_behavior: "create_prorations",
      cancel_at_period_end: false,
      metadata: {
        ...subscription.metadata,
        employer_id: input.employerId,
        plan_id: plan.id,
        plan_slug: planSlug,
      },
      payment_behavior: "pending_if_incomplete",
    });

    const sync = await syncEmployerSubscriptionFromStripe(updated);
    if (!sync.success) {
      safeError("[Billing] Post-upgrade sync failed", sync.error);
      // Stripe already updated — webhook should heal; still report success path
    }

    safeLog(
      `[Billing] In-place plan change employer=[REDACTED] ${currentSlug}->${planSlug} sub=${subscriptionId}`
    );

    return {
      mode: "updated",
      subscriptionId,
      planSlug,
    };
  } catch (err) {
    safeError("[Billing] stripe.subscriptions.update failed", err);
    return {
      error:
        "Could not update your subscription. Please try again or use Manage billing.",
    };
  }
}
