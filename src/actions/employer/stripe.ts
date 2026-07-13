"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/server/auth/session";
import { createSubscriptionCheckoutSession } from "@/lib/server/stripe/checkout-session";
import { changeEmployerSubscription } from "@/lib/server/stripe/change-subscription";
import { getStripe } from "@/lib/server/stripe/client";
import { syncEmployerSubscription } from "@/lib/server/stripe/sync-subscription";
import { planIdSchema, paymentIntentIdSchema } from "@/lib/validations/stripe";
import { safeError, safeLog } from "@/utils/logger";
import { formatFullName } from "@/lib/format/name";
import { getSiteUrl } from "@/lib/auth/site-url";
import { resolveStripePriceIdFromEnv } from "@/lib/server/stripe/plan";

export type StripeCheckoutResult = {
  /** True when an existing Stripe subscription was updated in place (no Checkout). */
  upgraded?: boolean;
  downgradeScheduled?: boolean;
  checkoutUrl?: string;
  planName?: string;
  planPrice?: number;
  planSlug?: string;
  message?: string;
  error?: string;
};

/**
 * Start a paid plan: update/schedule an existing Stripe subscription when
 * possible; otherwise open Checkout (subscription mode) for first-time paid.
 * @see https://docs.stripe.com/billing/subscriptions/change-price
 */
export async function createStripeCheckoutSession(
  planId: string
): Promise<StripeCheckoutResult> {
  try {
    const parsed = planIdSchema.parse({ planId });
    safeLog(`[Stripe] Initiating plan change for: ${parsed.planId}`);

    const { user, profile } = await requireRole("employer");

    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data: employerProfile } = await supabase
      .from("profiles")
      .select("first_name, middle_name, last_name")
      .eq("id", profile.id)
      .single();

    const { resolveBillingPlan } = await import("@/lib/server/stripe/plan");
    const plan = await resolveBillingPlan(parsed.planId);

    if (!plan) {
      return { error: "Billing plan not found." };
    }

    if (!getStripe()) {
      return {
        error:
          "Stripe is not configured. Set STRIPE_SECRET_KEY and use Stripe test mode.",
      };
    }

    const { data: subscription } = await supabase
      .from("employer_subscriptions")
      .select("stripe_subscription_id, stripe_customer_id, status")
      .eq("employer_id", profile.id)
      .maybeSingle();

    const subscriptionId = subscription?.stripe_subscription_id?.trim() || null;
    const customerId = subscription?.stripe_customer_id?.trim() || null;
    const status = subscription?.status || null;
    const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);
    const hasActiveSub = subscriptionId && status && ACTIVE_STATUSES.has(status);

    if (hasActiveSub) {
      const stripe = getStripe()!;
      const liveSub = await stripe.subscriptions.retrieve(subscriptionId);
      const item = liveSub.items.data[0];
      if (!item) {
        return { error: "No active subscription item found." };
      }
      const priceId = plan.stripe_price_id ?? resolveStripePriceIdFromEnv(plan.slug ?? "");
      if (!priceId) {
        return { error: "Target plan is missing a Stripe price ID." };
      }

      const siteUrl = getSiteUrl();
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId!,
        return_url: `${siteUrl}/employer/settings/account`,
        flow_data: {
          type: "subscription_update_confirm",
          subscription_update_confirm: {
            subscription: subscriptionId,
            items: [
              {
                id: item.id,
                price: priceId,
              },
            ],
          },
        },
      });

      return {
        upgraded: false,
        checkoutUrl: portalSession.url,
        planName: plan.name,
        planPrice: Number(plan.price),
      };
    }

    const name =
      formatFullName(employerProfile?.first_name, employerProfile?.middle_name, employerProfile?.last_name) ||
      "Employer";

    const session = await createSubscriptionCheckoutSession({
      employerId: profile.id,
      email: user.email || "",
      name,
      planRef: parsed.planId,
    });

    if ("error" in session) {
      return { error: session.error };
    }

    return {
      upgraded: false,
      checkoutUrl: session.checkoutUrl,
      planName: plan.name,
      planPrice: Number(plan.price),
    };
  } catch (err) {
    safeError("createStripeCheckoutSession error:", err);
    return {
      error: "An unexpected error occurred while setting up checkout.",
    };
  }
}

/** @deprecated Use createStripeCheckoutSession — kept for existing imports. */
export async function createStripeSubscription(
  planId: string
): Promise<{
  clientSecret: string | null;
  checkoutUrl?: string;
  planName?: string;
  planPrice?: number;
  error?: string;
}> {
  const result = await createStripeCheckoutSession(planId);
  return {
    clientSecret: null,
    checkoutUrl: result.checkoutUrl,
    planName: result.planName,
    planPrice: result.planPrice,
    error: result.error,
  };
}

/**
 * Server-side reconciliation after legacy PaymentIntent confirmation.
 * New checkouts use Stripe Checkout + webhooks instead.
 */
export async function reconcilePaymentIntent(
  paymentIntentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = paymentIntentIdSchema.parse({ paymentIntentId });
    const { profile } = await requireRole("employer");

    const stripe = getStripe();
    if (!stripe) {
      return {
        success: false,
        error: "Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.",
      };
    }

    const intent = await stripe.paymentIntents.retrieve(parsed.paymentIntentId);

    if (intent.status !== "succeeded") {
      return { success: false, error: "Payment has not completed yet." };
    }

    if (intent.metadata?.employer_id !== profile.id) {
      return { success: false, error: "Payment does not belong to this account." };
    }

    const planId = intent.metadata?.plan_id;
    if (!planId) {
      return { success: false, error: "Payment metadata is invalid." };
    }

    return syncEmployerSubscription({
      employerId: profile.id,
      planId,
      stripeCustomerId:
        typeof intent.customer === "string" ? intent.customer : intent.customer?.id,
      paymentIntentId: intent.id,
    });
  } catch (err) {
    safeError("reconcilePaymentIntent error:", err);
    return { success: false, error: "Failed to verify payment." };
  }
}
