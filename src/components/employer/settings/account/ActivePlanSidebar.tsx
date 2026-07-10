"use client";

import React from "react";
import Link from "next/link";
import { SubscriptionTier } from "@/types/employer/billing";
import { Check, AlertTriangle, CalendarDays } from "lucide-react";
import { TIER_LABELS } from "@/lib/entitlements/ui-copy";
import { formatMoney } from "@/lib/format/currency";

interface ActivePlanSidebarProps {
  currentPlan: SubscriptionTier;
  isCancelling: boolean;
  cancelAtPeriodEnd: boolean;
  onCancel: () => void;
  onManageBilling: () => void;
  isOpeningPortal: boolean;
  hasStripeSubscription: boolean;
  nextBillingDate?: string | null;
  scheduledPlan?: SubscriptionTier | null;
  scheduledEffectiveAt?: string | null;
}

function getFeatures(plan: SubscriptionTier): string[] {
  switch (plan) {
    case "scale":
      return [
        "Unlimited active job posts",
        "Unlimited applicants per job",
        "Instant job approvals",
        "Full profiles & resume downloads",
        "Direct messaging & priority support",
      ];
    case "growth":
      return [
        "10 active job posts",
        "Unlimited applicants per job",
        "Instant job approvals",
        "Full profiles & resume downloads",
        "Direct messaging & email support",
      ];
    case "starter":
      return [
        "3 active job posts",
        "20 applicants per job",
        "Instant job approvals",
        "Full profiles & resume downloads",
        "Direct messaging & email support",
      ];
    case "discovery":
    default:
      return [
        "1 active job post",
        "10 applicants per job",
        "Anonymous candidate previews",
        "2-day job approval",
      ];
  }
}

function planPrice(plan: SubscriptionTier): string {
  switch (plan) {
    case "starter":
      return `${formatMoney(19, "USD")}/mo`;
    case "growth":
      return `${formatMoney(39, "USD")}/mo`;
    case "scale":
      return `${formatMoney(79, "USD")}/mo`;
    default:
      return `${formatMoney(0, "USD")} — free forever`;
  }
}

function formatBillingDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function ActivePlanSidebar({
  currentPlan,
  isCancelling,
  cancelAtPeriodEnd,
  onCancel,
  onManageBilling,
  isOpeningPortal,
  hasStripeSubscription,
  nextBillingDate,
  scheduledPlan = null,
  scheduledEffectiveAt = null,
}: ActivePlanSidebarProps) {
  const features = getFeatures(currentPlan);
  const isPaid = currentPlan !== "discovery";
  const planLabel = TIER_LABELS[currentPlan];
  const movingToDiscovery =
    cancelAtPeriodEnd || scheduledPlan === "discovery";
  const paidDowngrade =
    scheduledPlan && scheduledPlan !== "discovery" ? scheduledPlan : null;

  return (
    <div className="space-y-6">
      <div className="bg-[#0a4a29] text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#22c55e]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-6 relative z-10">
          <div>
            <h3 className="text-lg font-bold">{planLabel} Plan Features</h3>
            <p className="text-sm text-emerald-200/90 font-medium mt-1">
              {planPrice(currentPlan)}
            </p>
            {isPaid && nextBillingDate ? (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                Next billing: {formatBillingDate(nextBillingDate)}
              </p>
            ) : null}
            {paidDowngrade ? (
              <p className="mt-2 text-xs font-semibold text-amber-200">
                Changes to {TIER_LABELS[paidDowngrade]}
                {scheduledEffectiveAt
                  ? ` on ${formatBillingDate(scheduledEffectiveAt)}`
                  : " at period end"}
              </p>
            ) : null}
          </div>

          <ul className="space-y-4">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3 text-sm font-medium text-emerald-100"
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-white shrink-0">
                  <Check size={12} />
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/employer/pricing"
            className="w-full h-11 bg-white hover:bg-slate-50 text-[#0a4a29] rounded-xl text-xs font-bold transition-all duration-200 shadow-sm mt-6 flex items-center justify-center"
          >
            Compare All Plans
          </Link>
        </div>
      </div>

      {isPaid && hasStripeSubscription ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-3">
          <button
            type="button"
            disabled={isOpeningPortal}
            onClick={onManageBilling}
            className="w-full h-11 text-xs font-bold text-[#006e2f] hover:bg-emerald-50 rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            {isOpeningPortal ? "Opening portal..." : "Manage billing in Stripe"}
          </button>
          <p className="text-[11px] text-center font-medium text-slate-400 leading-relaxed">
            Update payment method or open Stripe for receipts. Invoices also
            appear below on this page.
          </p>
        </div>
      ) : null}

      {isPaid ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center">
          {movingToDiscovery ? (
            <p className="text-xs font-medium text-amber-700 text-center mb-3">
              Moving to Discovery
              {scheduledEffectiveAt
                ? ` on ${formatBillingDate(scheduledEffectiveAt)}`
                : " at period end"}
              . Access continues until then.
            </p>
          ) : null}
          <button
            type="button"
            disabled={isCancelling || movingToDiscovery}
            onClick={() => {
              if (
                confirm(
                  "Move to Discovery at period end? You will keep access until the current billing cycle ends."
                )
              ) {
                onCancel();
              }
            }}
            className="w-full h-11 text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50/20 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <AlertTriangle size={14} />
            {isCancelling
              ? "Processing..."
              : movingToDiscovery
                ? "Discovery scheduled"
                : "Cancel → Discovery"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
