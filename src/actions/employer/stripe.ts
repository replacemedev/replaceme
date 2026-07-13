"use server";

import { requireRole } from "@/lib/server/auth/session";
import { createPlanChangeSession } from "@/lib/server/stripe/plan-change-session";
import { getStripe } from "@/lib/server/stripe/client";
import { syncEmployerSubscription } from "@/lib/server/stripe/sync-subscription";
import { planIdSchema, paymentIntentIdSchema } from "@/lib/validations/stripe";
import { safeError, safeLog } from "@/utils/logger";
import { formatFullName } from "@/lib/format/name";

export type StripeCheckoutResult = {
  /** Stripe Checkout or Customer Portal URL — never mutates subscription here. */
  checkoutUrl?: string;
  mode?: "checkout" | "portal_update";
  planName?: string;
  planPrice?: number;
  planSlug?: string;
  error?: string;
};

/**
 * Start a paid plan change via Stripe-hosted confirmation only.
 * Existing sub → Portal `subscription_update_confirm`.
 * First paid → Checkout Session.
 * DB updates only via webhooks after the customer confirms on Stripe.
 *
 * @see https://docs.stripe.com/customer-management/portal-deep-links
 */
export async function createStripeCheckoutSession(
  planId: string
): Promise<StripeCheckoutResult> {
  try {
    const parsed = planIdSchema.parse({ planId });
    safeLog(`[Stripe] Plan change session for: ${parsed.planId}`);

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

    const name =
      formatFullName(
        employerProfile?.first_name,
        employerProfile?.middle_name,
        employerProfile?.last_name
      ) || "Employer";

    const session = await createPlanChangeSession({
      employerId: profile.id,
      email: user.email || "",
      name,
      planRef: parsed.planId,
    });

    if ("error" in session) {
      return { error: session.error };
    }

    return {
      checkoutUrl: session.url,
      mode: session.mode,
      planName: plan.name,
      planPrice: Number(plan.price),
      planSlug: session.planSlug,
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
        error:
          "Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.",
      };
    }

    const intent = await stripe.paymentIntents.retrieve(parsed.paymentIntentId);

    if (intent.status !== "succeeded") {
      return { success: false, error: "Payment has not completed yet." };
    }

    if (intent.metadata?.employer_id !== profile.id) {
      return {
        success: false,
        error: "Payment does not belong to this account.",
      };
    }

    const planId = intent.metadata?.plan_id;
    if (!planId) {
      return { success: false, error: "Payment metadata is invalid." };
    }

    return syncEmployerSubscription({
      employerId: profile.id,
      planId,
      stripeCustomerId:
        typeof intent.customer === "string"
          ? intent.customer
          : intent.customer?.id,
      paymentIntentId: intent.id,
    });
  } catch (err) {
    safeError("reconcilePaymentIntent error:", err);
    return { success: false, error: "Failed to verify payment." };
  }
}
