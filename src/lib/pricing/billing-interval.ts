/**
 * Billing interval helpers for employer annual prepaid + monthly plans.
 * Annual = Stripe recurring.interval=year (one charge per year).
 * UI always shows a monthly equivalent; checkout discloses total due today.
 */

export type BillingInterval = "month" | "year";

export const DEFAULT_BILLING_INTERVAL: BillingInterval = "year";

/** Yearly prepaid USD (tax-exclusive) charged once per year. */
export const TIER_ANNUAL_PRICES: Record<
  "starter" | "growth" | "scale",
  number
> = {
  starter: 156,
  growth: 312,
  scale: 624,
};

/** Monthly-equivalent display for annual prepaid ($/mo). */
export const TIER_ANNUAL_MONTHLY_EQUIV: Record<
  "starter" | "growth" | "scale",
  number
> = {
  starter: 13,
  growth: 26,
  scale: 52,
};

/** Marketing save badges (rounded). */
export const TIER_ANNUAL_SAVE_PERCENT: Record<
  "starter" | "growth" | "scale",
  number
> = {
  starter: 32,
  growth: 33,
  scale: 34,
};

export function parseBillingInterval(
  value: string | null | undefined
): BillingInterval {
  return value === "month" ? "month" : "year";
}

export function annualMonthlyEquivalent(annualPrice: number): number {
  return Math.round((annualPrice / 12) * 100) / 100;
}

export function savePercent(
  monthlyPrice: number,
  annualMonthlyEquiv: number
): number {
  if (monthlyPrice <= 0) return 0;
  return Math.round(
    ((monthlyPrice - annualMonthlyEquiv) / monthlyPrice) * 100
  );
}

export function displayMonthlyPrice(
  monthlyPrice: number,
  annualPrice: number | null | undefined,
  interval: BillingInterval
): number {
  if (interval === "year" && annualPrice != null && annualPrice > 0) {
    return annualMonthlyEquivalent(annualPrice);
  }
  return monthlyPrice;
}
