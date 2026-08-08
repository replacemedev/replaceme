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
  titleClassName = "text-2xl font-bold text-slate-900 capitalize",
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
}

export function PricingCardPrice({
  shownPrice,
  annualTotal = null,
  isPaid = true,
  billingInterval = "year",
  monthlySubtext = "Billed monthly",
  freeSubtext,
  priceClassName = "text-4xl font-extrabold text-slate-900 tracking-tight",
  subtextClassName = "text-sm text-slate-500 font-medium",
}: PricingCardPriceProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline gap-1">
        <span className={priceClassName}>
          {formatMoney(shownPrice, "USD", {
            asReact: true,
            codeClassName: "text-slate-500 text-sm font-semibold ml-1",
          })}
        </span>
        <span className="text-sm font-medium text-slate-500">/month</span>
      </div>
      {annualTotal != null ? (
        <p className={subtextClassName}>
          Billed annually at{" "}
          {formatMoney(annualTotal, "USD", {
            asReact: true,
            codeClassName: "text-slate-400 text-xs font-semibold ml-0.5",
          })}
          /year
        </p>
      ) : isPaid && billingInterval === "month" ? (
        <p className={subtextClassName}>{monthlySubtext}</p>
      ) : freeSubtext ? (
        <p className={subtextClassName}>{freeSubtext}</p>
      ) : null}
    </div>
  );
}
