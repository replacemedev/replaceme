import { getSiteUrl } from "@/lib/auth/site-url";
import { requireStripe } from "@/lib/server/stripe/client";
import { ensureStripeCustomer } from "@/lib/server/stripe/ensure-customer";
import {
  resolveBillingPlan,
  resolveCheckoutLineItem,
} from "@/lib/server/stripe/plan";

type CreateCheckoutInput = {
  employerId: string;
  email: string;
  name: string;
  planRef: string;
};

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

  const customerResult = await ensureStripeCustomer({
    employerId: input.employerId,
    email: input.email,
    name: input.name,
  });

  if ("error" in customerResult) {
    return { error: customerResult.error };
  }

  const stripe = requireStripe();
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
