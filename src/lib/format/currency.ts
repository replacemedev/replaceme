export const COMPENSATION_CURRENCIES = [
  { code: "PHP", label: "Philippine Peso (₱)" },
  { code: "USD", label: "US Dollar ($)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "GBP", label: "British Pound (£)" },
  { code: "AUD", label: "Australian Dollar (A$)" },
  { code: "SGD", label: "Singapore Dollar (S$)" },
  { code: "CAD", label: "Canadian Dollar (C$)" },
] as const;

export type CompensationCurrency = (typeof COMPENSATION_CURRENCIES)[number]["code"];

export function formatMoney(
  amount: number,
  currency: string = "PHP",
  options?: { perHour?: boolean; maximumFractionDigits?: number }
): string {
  const digits = options?.maximumFractionDigits ?? 0;
  try {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
    }).format(amount);
    return options?.perHour ? `${formatted}/hr` : formatted;
  } catch {
    return options?.perHour ? `${currency} ${amount}/hr` : `${currency} ${amount}`;
  }
}

export function formatSalaryRange(
  min: number | null,
  max: number | null,
  currency: string = "PHP"
): string | null {
  if (min === null && max === null) return null;
  if (min !== null && max !== null) {
    return `${formatMoney(min, currency)} – ${formatMoney(max, currency)}`;
  }
  if (min !== null) return `From ${formatMoney(min, currency)}`;
  if (max !== null) return `Up to ${formatMoney(max, currency)}`;
  return null;
}

export function formatCurrency(
  amount: number,
  currencyCode: string,
  options?: { perHour?: boolean; maximumFractionDigits?: number }
): string {
  const digits = options?.maximumFractionDigits ?? 2;
  try {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
    }).format(amount);
    return options?.perHour ? `${formatted}/hr` : formatted;
  } catch {
    const code = currencyCode ? currencyCode.toUpperCase() : "USD";
    return options?.perHour ? `${code} ${amount}/hr` : `${code} ${amount}`;
  }
}
