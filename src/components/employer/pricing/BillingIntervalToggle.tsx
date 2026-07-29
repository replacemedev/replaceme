"use client";

import type { BillingInterval } from "@/lib/pricing/billing-interval";

interface BillingIntervalToggleProps {
  value: BillingInterval;
  onChange: (next: BillingInterval) => void;
  className?: string;
}

/**
 * Annual / Monthly billing toggle. Defaults to Annual in parents.
 */
export function BillingIntervalToggle({
  value,
  onChange,
  className = "",
}: BillingIntervalToggleProps) {
  return (
    <div
      className={`flex flex-col items-center gap-2 ${className}`}
      role="group"
      aria-label="Billing interval"
    >
      <div className="inline-flex min-h-11 w-full max-w-sm items-stretch rounded-full border border-slate-200 bg-slate-50 p-1 shadow-sm sm:w-auto">
        <button
          type="button"
          aria-pressed={value === "year"}
          onClick={() => onChange("year")}
          className={`min-h-10 flex-1 rounded-full px-5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/40 sm:flex-none sm:px-6 ${
            value === "year"
              ? "bg-[#006e2f] text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Annual
        </button>
        <button
          type="button"
          aria-pressed={value === "month"}
          onClick={() => onChange("month")}
          className={`min-h-10 flex-1 rounded-full px-5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/40 sm:flex-none sm:px-6 ${
            value === "month"
              ? "bg-[#006e2f] text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Monthly
        </button>
      </div>
      <p className="max-w-md px-2 text-center text-[11px] font-medium leading-snug text-slate-500">
        {value === "year"
          ? "Prices shown per month. Annual plans are billed once per year."
          : "Prices shown per month. Billed every month."}
      </p>
    </div>
  );
}
