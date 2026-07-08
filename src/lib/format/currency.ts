import React from "react";

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
  currency?: string,
  options?: { perHour?: boolean; maximumFractionDigits?: number; asReact?: false }
): string;
export function formatMoney(
  amount: number,
  currency: string,
  options: { perHour?: boolean; maximumFractionDigits?: number; asReact: true; codeClassName?: string }
): React.ReactNode;
export function formatMoney(
  amount: number,
  currency: string = "PHP",
  options?: { perHour?: boolean; maximumFractionDigits?: number; asReact?: boolean; codeClassName?: string }
): string | React.ReactNode {
  return formatCurrency(amount, currency, {
    perHour: options?.perHour,
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
    asReact: options?.asReact,
    codeClassName: options?.codeClassName,
  } as any);
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
  options?: { perHour?: boolean; maximumFractionDigits?: number; asReact?: false }
): string;
export function formatCurrency(
  amount: number,
  currencyCode: string,
  options: { perHour?: boolean; maximumFractionDigits?: number; asReact: true; codeClassName?: string }
): React.ReactNode;
export function formatCurrency(
  amount: number,
  currencyCode: string,
  options?: { perHour?: boolean; maximumFractionDigits?: number; asReact?: boolean; codeClassName?: string }
): string | React.ReactNode {
  const digits = options?.maximumFractionDigits ?? 2;
  const currencyUpper = currencyCode ? currencyCode.toUpperCase() : "USD";
  let formatted = "";
  try {
    formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyUpper,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
    }).format(amount);
  } catch {
    formatted = `${amount}`;
  }

  if (options?.asReact) {
    if (options.perHour) {
      return React.createElement(
        "span",
        null,
        formatted,
        React.createElement(
          "span",
          { className: options.codeClassName || "text-slate-500 text-sm ml-1" },
          ` ${currencyUpper}`
        ),
        "/hr"
      );
    }
    return React.createElement(
      "span",
      null,
      formatted,
      React.createElement(
        "span",
        { className: options.codeClassName || "text-slate-500 text-sm ml-1" },
        ` ${currencyUpper}`
      )
    );
  }

  if (options?.perHour) {
    return `${formatted} ${currencyUpper}/hr`;
  }
  return `${formatted} ${currencyUpper}`;
}
