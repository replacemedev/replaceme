/**
 * Admin display helpers for monthly vs annual prepaid subscriptions.
 */

export function formatAdminBillingAmount(
  unitAmountCents: number | null | undefined,
  billingInterval: string | null | undefined,
  fallbackMonthlyUsd?: number | null
): string {
  if (unitAmountCents != null && unitAmountCents > 0) {
    const dollars = unitAmountCents / 100;
    const formatted = dollars.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: dollars % 1 === 0 ? 0 : 2,
    });
    return billingInterval === "year" ? `${formatted}/yr` : `${formatted}/mo`;
  }

  if (fallbackMonthlyUsd != null && fallbackMonthlyUsd > 0) {
    return `$${fallbackMonthlyUsd}/mo`;
  }

  return "—";
}

export function billingIntervalLabel(
  billingInterval: string | null | undefined
): "Year" | "Month" | null {
  if (billingInterval === "year") return "Year";
  if (billingInterval === "month") return "Month";
  return null;
}
