import { getSiteUrl } from "@/lib/auth/site-url";
import { requireStripe } from "@/lib/server/stripe/client";
import { ensureStripeCustomer } from "@/lib/server/stripe/ensure-customer";
import {
  resolveBillingPlan,
  resolveCheckoutLineItem,
} from "@/lib/server/stripe/plan";
import { createAdminClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";

type CreateCheckoutInput = {
  employerId: string;
  email: string;
  name: string;
  planRef: string;
};

/**
 * New paid subscription via Checkout — only for employers without an active
 * Stripe subscription. Existing subscribers must use upgradeExistingSubscription.
 */
export async function createSubscriptionCheckoutSession(
  input: CreateCheckoutInput
): Promise<{ checkoutUrl: string } | { error: string }> {
  const plan = await resolveBillingPlan(input.planRef);

  if (!plan) {
    return { error: "Billing plan not found." };
  }

  if (plan.slug === "discovery" || Number(plan.price) <= 0) {
    return { error: "Discovery is free — no checkout required." };
  }

  const supabase = await createAdminClient();
  const { data: existing } = await supabase
    .from("employer_subscriptions")
    .select("stripe_subscription_id, status")
    .eq("employer_id", input.employerId)
    .maybeSingle();

  if (
    existing?.stripe_subscription_id &&
    (existing.status === "active" ||
      existing.status === "trialing" ||
      existing.status === "past_due")
  ) {
    return {
      error:
        "You already have an active subscription. Use plan change (in-app upgrade) instead of a new checkout.",
    };
  }

  const customerResult = await ensureStripeCustomer({
    employerId: input.employerId,
    email: input.email,
    name: input.name,
  });

  if ("error" in customerResult) {
    return { error: customerResult.error };
  }

  const stripe = requireStripe();

  // Guard: Stripe-side active subs (DB may be stale after duplicate bug)
  try {
    const active = await stripe.subscriptions.list({
      customer: customerResult.customerId,
      status: "active",
      limit: 5,
    });
    if (active.data.length > 0) {
      safeError(
        "[Billing] Refusing new Checkout — customer already has active Stripe subscription(s)",
        { count: active.data.length }
      );
      return {
        error:
          "An active Stripe subscription already exists for this account. Open Manage billing to change plans, or contact support if you see duplicates.",
      };
    }
  } catch (err) {
    safeError("[Billing] Failed listing customer subscriptions", err);
  }

  const siteUrl = getSiteUrl();
  const planSlug = plan.slug ?? input.planRef.toLowerCase();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerResult.customerId,
    line_items: [resolveCheckoutLineItem(plan)],
    success_url: `${siteUrl}/employer/settings/account?checkout=success`,
    cancel_url: `${siteUrl}/employer/pricing?checkout=canceled`,
    metadata: {
      employer_id: input.employerId,
      plan_id: plan.id,
      plan_slug: planSlug,
    },
    subscription_data: {
      metadata: {
        employer_id: input.employerId,
        plan_id: plan.id,
        plan_slug: planSlug,
      },
    },
    allow_promotion_codes: true,
  });

  if (!session.url) {
    return { error: "Stripe did not return a checkout URL." };
  }

  return { checkoutUrl: session.url };
}
