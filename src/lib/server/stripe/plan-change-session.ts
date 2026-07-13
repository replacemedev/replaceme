import type Stripe from "stripe";
import { getSiteUrl } from "@/lib/auth/site-url";
import { requireStripe } from "@/lib/server/stripe/client";
import { ensureStripeCustomer } from "@/lib/server/stripe/ensure-customer";
import { createSubscriptionCheckoutSession } from "@/lib/server/stripe/checkout-session";
import { ensurePortalPlanChangeConfiguration } from "@/lib/server/stripe/ensure-portal-plan-change";
import {
  resolveBillingPlan,
  resolveStripePriceIdFromEnv,
} from "@/lib/server/stripe/plan";
import { createAdminClient } from "@/lib/supabase/server";
import { safeError, safeLog } from "@/utils/logger";

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

export type PlanChangeSessionResult =
  | {
      url: string;
      mode: "checkout" | "portal_update";
      planSlug: string;
    }
  | { error: string };

function resolvePlanPriceId(plan: {
  stripe_price_id: string | null;
  slug: string | null;
}): string | null {
  return (
    plan.stripe_price_id ??
    resolveStripePriceIdFromEnv(plan.slug ?? "") ??
    null
  );
}

/**
 * Generate a Stripe-hosted confirmation URL for a plan change.
 * Never mutates the subscription here — DB updates come from webhooks only.
 *
 * - Existing paid sub → Customer Portal `subscription_update_confirm` deep link
 * - First paid plan → Checkout Session (mode=subscription)
 *
 * @see https://docs.stripe.com/customer-management/portal-deep-links
 * @see https://docs.stripe.com/payments/checkout
 */
export async function createPlanChangeSession(input: {
  employerId: string;
  email: string;
  name: string;
  planRef: string;
}): Promise<PlanChangeSessionResult> {
  const plan = await resolveBillingPlan(input.planRef);
  if (!plan) {
    return { error: "Billing plan not found." };
  }

  if (plan.slug === "discovery" || Number(plan.price) <= 0) {
    return {
      error:
        "Discovery is free. Use Cancel → Discovery to schedule moving to the free tier.",
    };
  }

  const priceId = resolvePlanPriceId(plan);
  if (!priceId) {
    return {
      error:
        "This plan is missing a Stripe price ID. Configure stripe_price_id or STRIPE_PRICE_* env.",
    };
  }

  const planSlug = (plan.slug ?? input.planRef).toLowerCase();
  const supabase = await createAdminClient();
  const { data: row } = await supabase
    .from("employer_subscriptions")
    .select("stripe_subscription_id, stripe_customer_id, status")
    .eq("employer_id", input.employerId)
    .maybeSingle();

  const subscriptionId = row?.stripe_subscription_id?.trim() || null;
  const status = row?.status || null;
  const hasActiveSub =
    Boolean(subscriptionId) &&
    Boolean(status) &&
    ACTIVE_STATUSES.has(status!);

  if (hasActiveSub && subscriptionId) {
    return createPortalUpdateConfirmSession({
      employerId: input.employerId,
      email: input.email,
      name: input.name,
      subscriptionId,
      trackedCustomerId: row?.stripe_customer_id?.trim() || null,
      priceId,
      planSlug,
    });
  }

  const checkout = await createSubscriptionCheckoutSession({
    employerId: input.employerId,
    email: input.email,
    name: input.name,
    planRef: input.planRef,
  });

  if ("error" in checkout) {
    return { error: checkout.error };
  }

  safeLog(`[Billing] Checkout session created for first-time plan=${planSlug}`);
  return {
    url: checkout.checkoutUrl,
    mode: "checkout",
    planSlug,
  };
}

async function createPortalUpdateConfirmSession(input: {
  employerId: string;
  email: string;
  name: string;
  subscriptionId: string;
  trackedCustomerId: string | null;
  priceId: string;
  planSlug: string;
}): Promise<PlanChangeSessionResult> {
  const stripe = requireStripe();
  const siteUrl = getSiteUrl();
  const returnUrl = `${siteUrl}/employer/settings/account?checkout=success`;

  let subscription: Stripe.Subscription;
  try {
    subscription = await stripe.subscriptions.retrieve(input.subscriptionId, {
      expand: ["items.data.price"],
    });
  } catch (err) {
    safeError("[Billing] Failed to retrieve subscription for portal update", err);
    return {
      error:
        "Could not find your Stripe subscription. Open Manage billing or contact support.",
    };
  }

  if (
    subscription.status === "canceled" ||
    subscription.status === "incomplete_expired"
  ) {
    return {
      error:
        "Your previous subscription is no longer active. Start a new plan from pricing.",
    };
  }

  const item = subscription.items.data[0];
  if (!item?.id) {
    return { error: "No billable subscription item found." };
  }

  const stripeCustomerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  let customerId = input.trackedCustomerId || stripeCustomerId || null;
  if (!customerId) {
    const ensured = await ensureStripeCustomer({
      employerId: input.employerId,
      email: input.email,
      name: input.name,
    });
    if ("error" in ensured) {
      return { error: ensured.error };
    }
    customerId = ensured.customerId;
  }

  if (stripeCustomerId && customerId !== stripeCustomerId) {
    safeError("[Billing] Portal update customer mismatch", {
      tracked: customerId,
      stripe: stripeCustomerId,
    });
    return {
      error:
        "Billing records are out of sync. Open Manage billing or contact support.",
    };
  }

  const portalConfig = await ensurePortalPlanChangeConfiguration();
  if ("error" in portalConfig) {
    return { error: portalConfig.error };
  }

  try {
    // Deep link into confirm screen — customer must explicitly confirm on Stripe.
    // Requires portal features.subscription_update.enabled + product catalog.
    // @see https://docs.stripe.com/customer-management/portal-deep-links
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId!,
      configuration: portalConfig.configurationId,
      return_url: returnUrl,
      flow_data: {
        type: "subscription_update_confirm",
        subscription_update_confirm: {
          subscription: input.subscriptionId,
          items: [
            {
              id: item.id,
              price: input.priceId,
              quantity: item.quantity ?? 1,
            },
          ],
        },
        after_completion: {
          type: "redirect",
          redirect: { return_url: returnUrl },
        },
      },
    });

    if (!session.url) {
      return { error: "Stripe did not return a portal URL." };
    }

    safeLog(
      `[Billing] Portal update_confirm session for plan=${input.planSlug} sub=${input.subscriptionId}`
    );

    return {
      url: session.url,
      mode: "portal_update",
      planSlug: input.planSlug,
    };
  } catch (err) {
    safeError("[Billing] billingPortal.sessions.create (update_confirm) failed", err);
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message?: string }).message)
        : "";
    if (/subscription update feature|portal configuration is disabled/i.test(message)) {
      return {
        error:
          "Stripe Customer Portal plan switching is still disabled. Open Stripe Dashboard → Settings → Billing → Customer portal, enable Switch plan, then retry.",
      };
    }
    return {
      error:
        message && message.length < 180
          ? message
          : "Could not open Stripe to confirm your plan change. Please try again.",
    };
  }
}
