import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { requireStripe } from "@/lib/server/stripe/client";
import {
  resolveBillingPlan,
  resolveBillingPlanByStripePriceId,
  resolveStripePriceIdFromEnv,
  type BillingPlanRow,
} from "@/lib/server/stripe/plan";
import { syncEmployerSubscriptionFromStripe } from "@/lib/server/stripe/sync-subscription";
import {
  isHigherTier,
  isLowerTier,
  normalizePlanSlug,
} from "@/lib/entitlements/ui-copy";
import type { SubscriptionTier } from "@/types/employer/billing";
import { safeError, safeLog } from "@/utils/logger";

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

function resolvePlanPriceId(plan: BillingPlanRow): string | null {
  return (
    plan.stripe_price_id ??
    resolveStripePriceIdFromEnv(plan.slug ?? "") ??
    null
  );
}

function stripeErrDetail(err: unknown): {
  message: string;
  code?: string;
  type?: string;
} {
  if (err && typeof err === "object") {
    const e = err as {
      message?: string;
      code?: string;
      type?: string;
      raw?: { message?: string; code?: string; type?: string };
    };
    return {
      message: e.raw?.message || e.message || "Stripe request failed",
      code: e.raw?.code || e.code,
      type: e.raw?.type || e.type,
    };
  }
  return { message: "Stripe request failed" };
}

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): number | null {
  const top = (subscription as Stripe.Subscription & {
    current_period_end?: number;
  }).current_period_end;
  if (typeof top === "number" && top > 0) return top;

  const itemEnd = (
    subscription.items.data[0] as Stripe.SubscriptionItem & {
      current_period_end?: number;
    }
  )?.current_period_end;
  if (typeof itemEnd === "number" && itemEnd > 0) return itemEnd;

  return null;
}

function scheduleIdOf(subscription: Stripe.Subscription): string | null {
  if (!subscription.schedule) return null;
  return typeof subscription.schedule === "string"
    ? subscription.schedule
    : subscription.schedule.id;
}

export type ChangeSubscriptionResult =
  | {
      mode: "upgraded";
      subscriptionId: string;
      planSlug: string;
      message: string;
    }
  | {
      mode: "downgrade_scheduled";
      subscriptionId: string;
      planSlug: string;
      effectiveAt: string;
      message: string;
    }
  | { mode: "checkout_required" }
  | { error: string };

/**
 * @deprecated Do **not** use for employer Manage Plan / checkout UX.
 * Plan changes must go through Stripe Checkout or Customer Portal
 * (`createPlanChangeSession`) so the customer explicitly confirms.
 * This module performs direct `subscriptions.update` / schedules and is
 * reserved for emergency/admin tooling only — never call from UI actions.
 *
 * @see src/lib/server/stripe/plan-change-session.ts
 * @see https://docs.stripe.com/customer-management/portal-deep-links
 */
export async function changeEmployerSubscription(input: {
  employerId: string;
  planRef: string;
}): Promise<ChangeSubscriptionResult> {
  const plan = await resolveBillingPlan(input.planRef);
  if (!plan) {
    return { error: "Billing plan not found." };
  }

  if (plan.slug === "discovery" || Number(plan.price) <= 0) {
    return {
      error:
        "To move to Discovery, cancel your paid plan (ends at period end) from Account settings.",
    };
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

  if (!subscriptionId || !row?.status || !ACTIVE_STATUSES.has(row.status)) {
    return { mode: "checkout_required" };
  }

  if (!customerId) {
    return {
      error:
        "Your billing account is missing a Stripe customer ID. Open Manage billing or contact support before changing plans.",
    };
  }

  const targetSlug = normalizePlanSlug(plan.slug ?? input.planRef);
  const stripe = requireStripe();

  let subscription: Stripe.Subscription;
  try {
    // Always read live Stripe state — never trust a cached item id / plan slug.
    subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["items.data.price", "schedule"],
    });
  } catch (err) {
    safeError("[Billing] Stripe retrieve subscription failed", stripeErrDetail(err));
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

  if (subscription.status === "incomplete") {
    return {
      error:
        "Your previous plan change is still waiting on payment. Complete or cancel that invoice in Manage billing, then try again.",
    };
  }

  const stripeCustomerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  if (!stripeCustomerId || stripeCustomerId !== customerId) {
    safeError("[Billing] customer_id mismatch", {
      trackedCustomer: customerId,
      stripeCustomer: stripeCustomerId,
    });
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

  // Resolve current tier from live Stripe price metadata / DB price map — not stale DB slug.
  const livePriceId =
    typeof item.price === "string" ? item.price : item.price?.id;
  let currentSlug = normalizePlanSlug(row.plan_slug ?? "discovery");
  if (livePriceId) {
    const livePlan = await resolveBillingPlanByStripePriceId(livePriceId);
    if (livePlan?.slug) {
      currentSlug = normalizePlanSlug(livePlan.slug);
    } else if (subscription.metadata?.plan_slug) {
      currentSlug = normalizePlanSlug(subscription.metadata.plan_slug);
    }
  }

  if (currentSlug === targetSlug && !row.cancel_at_period_end) {
    const existingSchedule = scheduleIdOf(subscription);
    if (!existingSchedule) {
      return { error: "You are already on this plan." };
    }
  }

  const siblingGuard = await assertNoConflictingSubscriptions(
    stripe,
    customerId,
    subscriptionId
  );
  if (siblingGuard) return siblingGuard;

  // Pending updates from payment_behavior=pending_if_incomplete block the next update.
  if (subscription.pending_update) {
    safeError("[Billing] Refusing change — pending_update present", {
      subscriptionId,
      pending: subscription.pending_update,
    });
    return {
      error:
        "A previous plan change is still pending payment confirmation. Finish it in Manage billing (or wait a minute), then try again.",
    };
  }

  if (isHigherTier(targetSlug, currentSlug)) {
    return applyImmediateUpgrade({
      stripe,
      subscription,
      subscriptionId,
      item,
      priceId,
      employerId: input.employerId,
      planId: plan.id,
      planSlug: targetSlug,
      currentSlug,
    });
  }

  if (isLowerTier(targetSlug, currentSlug)) {
    if (!livePriceId) {
      return {
        error:
          "Could not resolve your current Stripe price. Open Manage billing or contact support.",
      };
    }
    return schedulePeriodEndDowngrade({
      stripe,
      subscription,
      subscriptionId,
      item,
      currentPriceId: livePriceId,
      targetPriceId: priceId,
      employerId: input.employerId,
      planId: plan.id,
      planSlug: targetSlug,
      currentSlug,
    });
  }

  // Same tier but cancel_at_period_end or schedule — treat as re-assert current paid plan.
  return applyImmediateUpgrade({
    stripe,
    subscription,
    subscriptionId,
    item,
    priceId,
    employerId: input.employerId,
    planId: plan.id,
    planSlug: targetSlug,
    currentSlug,
  });
}

async function assertNoConflictingSubscriptions(
  stripe: Stripe,
  customerId: string,
  trackedSubscriptionId: string
): Promise<{ error: string } | null> {
  const [active, trialing, pastDue] = await Promise.all([
    stripe.subscriptions.list({ customer: customerId, status: "active", limit: 10 }),
    stripe.subscriptions.list({ customer: customerId, status: "trialing", limit: 10 }),
    stripe.subscriptions.list({ customer: customerId, status: "past_due", limit: 10 }),
  ]);

  const extras = [...active.data, ...trialing.data, ...pastDue.data].filter(
    (s) => s.id !== trackedSubscriptionId
  );

  if (extras.length === 0) return null;

  // Auto-clean duplicates left by the old Checkout bug when they are already
  // set to cancel — otherwise block so we never mutate the wrong sub.
  const canceling = extras.filter((s) => s.cancel_at_period_end);
  const hardExtras = extras.filter((s) => !s.cancel_at_period_end);

  for (const dup of canceling) {
    try {
      await stripe.subscriptions.cancel(dup.id, { prorate: false });
      safeLog(
        `[Billing] Canceled leftover duplicate subscription ${dup.id} (was cancel_at_period_end)`
      );
    } catch (err) {
      safeError("[Billing] Failed canceling duplicate sub", stripeErrDetail(err));
      return {
        error:
          "Multiple Stripe subscriptions detected. Cancel the duplicate in Manage billing, then try again.",
      };
    }
  }

  if (hardExtras.length > 0) {
    safeError("[Billing] Hard duplicate active subscriptions", {
      tracked: trackedSubscriptionId,
      extras: hardExtras.map((s) => s.id),
    });
    return {
      error:
        "Multiple active Stripe subscriptions detected. Use Manage billing to cancel the duplicate, then try again.",
    };
  }

  return null;
}

async function releaseScheduleIfPresent(
  stripe: Stripe,
  subscription: Stripe.Subscription
): Promise<{ error: string } | null> {
  const scheduleId = scheduleIdOf(subscription);
  if (!scheduleId) return null;

  try {
    await stripe.subscriptionSchedules.release(scheduleId);
    safeLog(`[Billing] Released subscription schedule ${scheduleId} before plan change`);
    return null;
  } catch (err) {
    const detail = stripeErrDetail(err);
    // Already released / not modifiable — continue if subscription is free of schedule.
    if (detail.code === "resource_missing") return null;
    safeError("[Billing] Failed to release schedule", detail);
    return {
      error:
        "A scheduled plan change is blocking this update. Open Manage billing or try again in a moment.",
    };
  }
}

async function applyImmediateUpgrade(input: {
  stripe: Stripe;
  subscription: Stripe.Subscription;
  subscriptionId: string;
  item: Stripe.SubscriptionItem;
  priceId: string;
  employerId: string;
  planId: string;
  planSlug: SubscriptionTier;
  currentSlug: string;
}): Promise<ChangeSubscriptionResult> {
  const released = await releaseScheduleIfPresent(
    input.stripe,
    input.subscription
  );
  if (released) return released;

  // Re-fetch item id after possible schedule release (subscription may refresh).
  let live: Stripe.Subscription;
  try {
    live = await input.stripe.subscriptions.retrieve(input.subscriptionId, {
      expand: ["items.data.price"],
    });
  } catch (err) {
    safeError("[Billing] re-retrieve after schedule release failed", stripeErrDetail(err));
    return { error: "Could not refresh subscription state. Please try again." };
  }

  if (live.pending_update) {
    return {
      error:
        "A previous plan change is still pending payment confirmation. Finish it in Manage billing, then try again.",
    };
  }

  const item = live.items.data[0];
  if (!item?.id) {
    return { error: "Subscription item missing after refresh. Contact support." };
  }

  try {
    // error_if_incomplete: apply fully or fail — never leave pending_update that
    // blocks the next sequential upgrade (Starter→Growth→Scale).
    // create_prorations: credit unused time; charge difference on next invoice.
    const updated = await input.stripe.subscriptions.update(input.subscriptionId, {
      items: [
        {
          id: item.id,
          price: input.priceId,
          quantity: item.quantity ?? 1,
        },
      ],
      proration_behavior: "create_prorations",
      cancel_at_period_end: false,
      payment_behavior: "error_if_incomplete",
      metadata: {
        ...live.metadata,
        employer_id: input.employerId,
        plan_id: input.planId,
        plan_slug: input.planSlug,
      },
    });

    const sync = await syncEmployerSubscriptionFromStripe(updated);
    if (!sync.success) {
      safeError("[Billing] Post-upgrade sync failed", sync.error);
    }

    // Clear any pending period-end downgrade after an immediate upgrade.
    const supabase = await createAdminClient();
    await supabase
      .from("employer_subscriptions")
      .update({
        scheduled_plan_slug: null,
        scheduled_effective_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("employer_id", input.employerId);

    safeLog(
      `[Billing] Upgrade ${input.currentSlug}->${input.planSlug} sub=${input.subscriptionId}`
    );

    try {
      const { notifyEmployerSubscriptionAlert } = await import("@/actions/email");
      await notifyEmployerSubscriptionAlert({
        employerId: input.employerId,
        kind: "upgraded",
        planSlug: input.planSlug,
        previousPlanSlug: input.currentSlug,
        idempotencyKey: `subscription-upgrade/${input.employerId}/${input.planSlug}/${input.subscriptionId}`,
      });
    } catch (err) {
      safeError("[Billing] upgrade email failed", err);
    }

    return {
      mode: "upgraded",
      subscriptionId: input.subscriptionId,
      planSlug: input.planSlug,
      message: `Your plan is now ${input.planSlug}. Proration will appear on your next Stripe invoice.`,
    };
  } catch (err) {
    const detail = stripeErrDetail(err);
    safeError("[Billing] stripe.subscriptions.update failed", detail);

    if (
      detail.code === "subscription_payment_intent_requires_action" ||
      detail.code === "invoice_payment_intent_requires_action"
    ) {
      return {
        error:
          "Your bank requires extra authentication for this upgrade. Open Manage billing to complete payment, then try again.",
      };
    }

    if (detail.code === "card_declined" || detail.code === "invoice_payment_failed") {
      return {
        error:
          "Payment for this upgrade failed. Update your card in Manage billing, then try again.",
      };
    }

    return {
      error:
        detail.message && detail.message.length < 180
          ? detail.message
          : "Could not update your subscription. Please try again or use Manage billing.",
    };
  }
}

async function schedulePeriodEndDowngrade(input: {
  stripe: Stripe;
  subscription: Stripe.Subscription;
  subscriptionId: string;
  item: Stripe.SubscriptionItem;
  currentPriceId: string;
  targetPriceId: string;
  employerId: string;
  planId: string;
  planSlug: SubscriptionTier;
  currentSlug: string;
}): Promise<ChangeSubscriptionResult> {
  const periodEnd = getSubscriptionPeriodEnd(input.subscription);
  if (!periodEnd) {
    return {
      error:
        "Could not determine your billing period end. Use Manage billing or contact support.",
    };
  }

  // Replace any existing schedule (prior downgrade / portal change).
  const released = await releaseScheduleIfPresent(
    input.stripe,
    input.subscription
  );
  if (released) return released;

  // Clear cancel_at_period_end so the sub continues into the lower tier.
  if (input.subscription.cancel_at_period_end) {
    try {
      await input.stripe.subscriptions.update(input.subscriptionId, {
        cancel_at_period_end: false,
      });
    } catch (err) {
      safeError("[Billing] clear cancel_at_period_end failed", stripeErrDetail(err));
    }
  }

  try {
    const schedule = await input.stripe.subscriptionSchedules.create({
      from_subscription: input.subscriptionId,
    });

    const currentPhase = schedule.phases[0];
    if (!currentPhase) {
      return { error: "Stripe did not return a schedule phase. Please try again." };
    }

    const updatedSchedule = await input.stripe.subscriptionSchedules.update(
      schedule.id,
      {
        end_behavior: "release",
        phases: [
          {
            start_date: currentPhase.start_date,
            end_date: periodEnd,
            items: [
              {
                price: input.currentPriceId,
                quantity: input.item.quantity ?? 1,
              },
            ],
            proration_behavior: "none",
          },
          {
            start_date: periodEnd,
            items: [
              {
                price: input.targetPriceId,
                quantity: input.item.quantity ?? 1,
              },
            ],
            proration_behavior: "none",
            metadata: {
              employer_id: input.employerId,
              plan_id: input.planId,
              plan_slug: input.planSlug,
            },
          },
        ],
        metadata: {
          employer_id: input.employerId,
          scheduled_plan_slug: input.planSlug,
          scheduled_plan_id: input.planId,
        },
      }
    );

    // Keep current entitlements; annotate metadata for support / future UI.
    await input.stripe.subscriptions.update(input.subscriptionId, {
      metadata: {
        ...input.subscription.metadata,
        employer_id: input.employerId,
        plan_slug: input.currentSlug,
        scheduled_plan_slug: input.planSlug,
        scheduled_plan_id: input.planId,
      },
    });

    const effectiveAt = new Date(periodEnd * 1000).toISOString();
    const supabase = await createAdminClient();
    await supabase
      .from("employer_subscriptions")
      .update({
        cancel_at_period_end: false,
        scheduled_plan_slug: input.planSlug,
        scheduled_effective_at: effectiveAt,
        updated_at: new Date().toISOString(),
      })
      .eq("employer_id", input.employerId);

    safeLog(
      `[Billing] Downgrade scheduled ${input.currentSlug}->${input.planSlug} at ${effectiveAt} schedule=${updatedSchedule.id}`
    );

    return {
      mode: "downgrade_scheduled",
      subscriptionId: input.subscriptionId,
      planSlug: input.planSlug,
      effectiveAt,
      message: `Downgrade to ${input.planSlug} is scheduled for ${new Date(
        periodEnd * 1000
      ).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}. You keep ${input.currentSlug} until then.`,
    };
  } catch (err) {
    const detail = stripeErrDetail(err);
    safeError("[Billing] schedulePeriodEndDowngrade failed", detail);
    return {
      error:
        detail.message && detail.message.length < 180
          ? detail.message
          : "Could not schedule your downgrade. Please try again or use Manage billing.",
    };
  }
}

/** @deprecated Prefer changeEmployerSubscription — kept for existing imports. */
export async function upgradeExistingSubscription(input: {
  employerId: string;
  planRef: string;
}): Promise<
  | { mode: "updated"; subscriptionId: string; planSlug: string }
  | { mode: "checkout_required" }
  | { error: string }
> {
  const result = await changeEmployerSubscription(input);
  if ("error" in result) return { error: result.error };
  if (result.mode === "checkout_required") return { mode: "checkout_required" };
  if (result.mode === "upgraded" || result.mode === "downgrade_scheduled") {
    return {
      mode: "updated",
      subscriptionId: result.subscriptionId,
      planSlug: result.planSlug,
    };
  }
  return { error: "Unexpected billing response." };
}
