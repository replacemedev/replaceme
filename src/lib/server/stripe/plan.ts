import type Stripe from "stripe";
import {
  type BillingInterval,
  DEFAULT_BILLING_INTERVAL,
} from "@/lib/pricing/billing-interval";
import { createAdminClient } from "@/lib/supabase/server";

export type BillingPlanRow = {
  id: string;
  slug: string | null;
  name: string;
  price: number;
  annual_price: number | null;
  stripe_price_id: string | null;
  stripe_price_id_yearly: string | null;
  stripe_product_id: string | null;
};

const PLAN_SELECT =
  "id, slug, name, price, annual_price, stripe_price_id, stripe_price_id_yearly, stripe_product_id";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isBillingPlanUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export async function resolveBillingPlan(
  planRef: string
): Promise<BillingPlanRow | null> {
  const supabase = await createAdminClient();

  const base = supabase.from("billing_plans").select(PLAN_SELECT);

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

  const { data: monthly, error: monthlyError } = await supabase
    .from("billing_plans")
    .select(PLAN_SELECT)
    .eq("stripe_price_id", stripePriceId)
    .maybeSingle();

  if (!monthlyError && monthly) {
    return monthly;
  }

  const { data: yearly, error: yearlyError } = await supabase
    .from("billing_plans")
    .select(PLAN_SELECT)
    .eq("stripe_price_id_yearly", stripePriceId)
    .maybeSingle();

  if (yearlyError || !yearly) {
    return null;
  }

  return yearly;
}

export async function resolveBillingPlanByStripeProductId(
  stripeProductId: string
): Promise<BillingPlanRow | null> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("billing_plans")
    .select(PLAN_SELECT)
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

export function resolveStripeYearlyPriceIdFromEnv(slug: string): string | null {
  const envKey = `STRIPE_PRICE_${slug.toUpperCase()}_YEARLY`;
  const value = process.env[envKey];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

export function resolvePlanStripePriceId(
  plan: BillingPlanRow,
  interval: BillingInterval = DEFAULT_BILLING_INTERVAL
): string | null {
  if (interval === "year") {
    return (
      plan.stripe_price_id_yearly ??
      resolveStripeYearlyPriceIdFromEnv(plan.slug ?? "") ??
      null
    );
  }
  return (
    plan.stripe_price_id ?? resolveStripePriceIdFromEnv(plan.slug ?? "") ?? null
  );
}

export function resolveCheckoutLineItem(
  plan: BillingPlanRow,
  interval: BillingInterval = DEFAULT_BILLING_INTERVAL
): Stripe.Checkout.SessionCreateParams.LineItem {
  const stripePriceId = resolvePlanStripePriceId(plan, interval);

  if (stripePriceId) {
    return { price: stripePriceId, quantity: 1 };
  }

  const slug = plan.slug ?? "plan";

  if (interval === "year") {
    const annual =
      plan.annual_price != null && Number(plan.annual_price) > 0
        ? Number(plan.annual_price)
        : Number(plan.price) * 12;
    return {
      price_data: {
        currency: "usd",
        unit_amount: Math.round(annual * 100),
        recurring: { interval: "year" },
        product_data: {
          name: plan.name,
          metadata: {
            plan_slug: slug,
            plan_id: plan.id,
            billing_interval: "year",
          },
        },
      },
      quantity: 1,
    };
  }

  const priceInCents = Math.round(Number(plan.price) * 100);

  return {
    price_data: {
      currency: "usd",
      unit_amount: priceInCents,
      recurring: { interval: "month" },
      product_data: {
        name: plan.name,
        metadata: {
          plan_slug: slug,
          plan_id: plan.id,
          billing_interval: "month",
        },
      },
    },
    quantity: 1,
  };
}
