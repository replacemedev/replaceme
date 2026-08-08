"use client";

import React from "react";
import { formatMoney } from "@/lib/format/currency";
import { type BillingInterval } from "@/lib/pricing/billing-interval";

export interface PricingCardHeaderProps {
  title: React.ReactNode;
  savePct?: number | null;
  className?: string;
  titleClassName?: string;
  badgeClassName?: string;
}

export function PricingCardHeader({
  title,
  savePct,
  className = "flex items-center justify-between gap-2 flex-wrap mb-4",
  titleClassName = "text-xl md:text-2xl font-bold text-slate-900 capitalize whitespace-nowrap",
  badgeClassName = "inline-flex shrink-0 items-center rounded-full bg-[#e6fbf2] px-2.5 py-1 text-xs font-bold text-[#006e2f]",
}: PricingCardHeaderProps) {
  return (
    <div className={className}>
      {typeof title === "string" ? (
        <h3 className={titleClassName}>{title}</h3>
      ) : (
        title
      )}
      {savePct != null ? (
        <span className={badgeClassName}>
          SAVE {savePct}%
        </span>
      ) : null}
    </div>
  );
}

export interface PricingCardPriceProps {
  shownPrice: number;
  annualTotal?: number | null;
  isPaid?: boolean;
  billingInterval?: BillingInterval;
  monthlySubtext?: string;
  freeSubtext?: string;
  priceClassName?: string;
  subtextClassName?: string;
  centered?: boolean;
}

export function PricingCardPrice({
  shownPrice,
  annualTotal = null,
  isPaid = true,
  billingInterval = "year",
  freeSubtext,
  priceClassName = "text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight whitespace-nowrap",
  subtextClassName = "text-xs text-slate-500 font-medium",
  centered = false,
}: PricingCardPriceProps) {
  const formattedPrice = formatMoney(shownPrice, "USD", { symbolOnly: true });

  return (
    <div className="space-y-1">
      <div className={`flex items-baseline gap-1.5 flex-nowrap mt-3 ${centered ? "justify-center" : ""}`}>
        <span className={`shrink-0 ${priceClassName}`}>{formattedPrice}</span>
        <span className="text-xs sm:text-sm font-semibold text-slate-500 whitespace-nowrap shrink-0">
          {isPaid ? "USD / mo" : "USD"}
        </span>
      </div>
      <div className={`min-h-[20px] mt-1 flex items-center ${centered ? "justify-center text-center" : ""}`}>
        {annualTotal != null ? (
          <p className={subtextClassName}>
            Billed annually at{" "}
            <span className="whitespace-nowrap font-semibold">
              {formatMoney(annualTotal, "USD", { symbolOnly: true })} USD/yr
            </span>
          </p>
        ) : !isPaid && freeSubtext ? (
          <p className={subtextClassName}>{freeSubtext}</p>
        ) : null}
      </div>
    </div>
  );
}
