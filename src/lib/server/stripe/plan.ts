import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";

export type BillingPlanRow = {
  id: string;
  slug: string | null;
  name: string;
  price: number;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isBillingPlanUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export async function resolveBillingPlan(
  planRef: string
): Promise<BillingPlanRow | null> {
  const supabase = await createAdminClient();

  const base = supabase
    .from("billing_plans")
    .select("id, slug, name, price, stripe_price_id, stripe_product_id");

  const { data, error } = isBillingPlanUuid(planRef)
    ? await base.eq("id", planRef).maybeSingle()
    : await base.eq("slug", planRef.toLowerCase()).maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function resolveBillingPlanByStripePriceId(
  stripePriceId: string
): Promise<BillingPlanRow | null> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("billing_plans")
    .select("id, slug, name, price, stripe_price_id, stripe_product_id")
    .eq("stripe_price_id", stripePriceId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function resolveBillingPlanByStripeProductId(
  stripeProductId: string
): Promise<BillingPlanRow | null> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("billing_plans")
    .select("id, slug, name, price, stripe_price_id, stripe_product_id")
    .eq("stripe_product_id", stripeProductId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function getDiscoveryPlan(): Promise<BillingPlanRow | null> {
  return resolveBillingPlan("discovery");
}

export function resolveStripePriceIdFromEnv(slug: string): string | null {
  const envKey = `STRIPE_PRICE_${slug.toUpperCase()}`;
  const value = process.env[envKey];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

export function resolveCheckoutLineItem(
  plan: BillingPlanRow
): Stripe.Checkout.SessionCreateParams.LineItem {
  const stripePriceId =
    plan.stripe_price_id ?? resolveStripePriceIdFromEnv(plan.slug ?? "");

  if (stripePriceId) {
    return { price: stripePriceId, quantity: 1 };
  }

  const slug = plan.slug ?? "plan";
  const priceInCents = Math.round(Number(plan.price) * 100);

  return {
    price_data: {
      currency: "usd",
      unit_amount: priceInCents,
      recurring: { interval: "month" },
      product_data: {
        name: plan.name,
        metadata: { plan_slug: slug, plan_id: plan.id },
      },
    },
    quantity: 1,
  };
}
