import type Stripe from "stripe";

export function extractSubscriptionPrice(
  subscription: Stripe.Subscription
): { unitAmountCents: number | null; billingInterval: "month" | "year" | null } {
  const price = subscription.items.data[0]?.price;
  if (!price?.unit_amount) {
    return { unitAmountCents: null, billingInterval: null };
  }

  const interval = price.recurring?.interval;
  const billingInterval =
    interval === "year" ? "year" : interval === "month" ? "month" : null;

  return {
    unitAmountCents: price.unit_amount,
    billingInterval,
  };
}

export function monthlyMrrCents(
  unitAmountCents: number | null,
  billingInterval: "month" | "year" | null
): number {
  if (!unitAmountCents) return 0;
  if (billingInterval === "year") return Math.round(unitAmountCents / 12);
  return unitAmountCents;
}
