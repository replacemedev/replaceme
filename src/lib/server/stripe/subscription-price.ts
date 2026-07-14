import type Stripe from "stripe";

type ExpandedPrice = Stripe.Price;

/**
 * Prefer the primary recurring subscription item (highest unit amount).
 * Avoids picking a transitional / zero-dollar item during Portal prorations.
 */
export function getPrimarySubscriptionItem(
  subscription: Stripe.Subscription
): Stripe.SubscriptionItem | null {
  const items = subscription.items?.data ?? [];
  if (items.length === 0) return null;

  const recurring = items.filter((item) => {
    const price = item.price;
    if (!price || typeof price === "string") return true;
    return Boolean(price.recurring);
  });

  const pool = recurring.length > 0 ? recurring : items;

  let best = pool[0]!;
  let bestAmount = unitAmountOf(best.price) ?? -1;

  for (let i = 1; i < pool.length; i++) {
    const amount = unitAmountOf(pool[i]!.price) ?? -1;
    if (amount > bestAmount) {
      best = pool[i]!;
      bestAmount = amount;
    }
  }

  return best;
}

function unitAmountOf(
  price: string | ExpandedPrice | null | undefined
): number | null {
  if (!price || typeof price === "string") return null;
  return price.unit_amount ?? null;
}

export function getPrimaryPrice(
  subscription: Stripe.Subscription
): ExpandedPrice | null {
  const item = getPrimarySubscriptionItem(subscription);
  if (!item?.price) return null;
  return typeof item.price === "string" ? null : item.price;
}

export function extractSubscriptionPrice(
  subscription: Stripe.Subscription
): { unitAmountCents: number | null; billingInterval: "month" | "year" | null } {
  const price = getPrimaryPrice(subscription);
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

/**
 * Stripe Billing API moved period timestamps onto items in newer versions.
 */
export function extractSubscriptionPeriod(
  subscription: Stripe.Subscription
): { start: number | null; end: number | null } {
  const legacy = subscription as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
  };
  if (legacy.current_period_end) {
    return {
      start: legacy.current_period_start ?? null,
      end: legacy.current_period_end ?? null,
    };
  }

  const item = getPrimarySubscriptionItem(subscription) as
    | (Stripe.SubscriptionItem & {
        current_period_start?: number;
        current_period_end?: number;
      })
    | null;

  return {
    start: item?.current_period_start ?? null,
    end: item?.current_period_end ?? null,
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
