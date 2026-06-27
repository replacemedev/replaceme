"use client";

import React from "react";
import { SubscriptionTier } from "@/types/employer/billing";
import { Sparkles } from "lucide-react";
import {
  isCurrentTier,
  isHigherTier,
  isLowerTier,
} from "@/lib/entitlements/ui-copy";

interface ManagePlanGridProps {
  currentPlan: SubscriptionTier;
  isUpgrading: boolean;
  onUpgrade: (planId: SubscriptionTier) => void;
  onManageBilling: () => void;
  isOpeningPortal: boolean;
  nextBillingDate?: string | null;
}

const UPGRADE_PLANS: {
  slug: SubscriptionTier;
  label: string;
  price: string;
  detail?: string;
  highlight?: boolean;
}[] = [
  { slug: "discovery", label: "Discovery", price: "$0 USD" },
  {
    slug: "starter",
    label: "Starter",
    price: "$19 USD",
    detail: "3 jobs · 20 applicants/job",
  },
  {
    slug: "growth",
    label: "Growth",
    price: "$39 USD",
    detail: "10 jobs · 50 applicants/job",
    highlight: true,
  },
  {
    slug: "scale",
    label: "Scale",
    price: "$79 USD",
    detail: "Unlimited jobs & applicants",
  },
];

export function ManagePlanGrid({
  currentPlan,
  isUpgrading,
  onUpgrade,
  onManageBilling,
  isOpeningPortal,
  nextBillingDate,
}: ManagePlanGridProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Manage Plan</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Upgrades take effect immediately. Downgrades apply at the end of your
            billing period via the Stripe billing portal.
          </p>
        </div>
        {nextBillingDate && currentPlan !== "discovery" ? (
          <p className="text-xs font-semibold text-slate-500">
            Next billing:{" "}
            <span className="text-slate-800">
              {new Date(nextBillingDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {UPGRADE_PLANS.map((plan) => {
          const isCurrent = isCurrentTier(plan.slug, currentPlan);
          const isUpgrade = isHigherTier(plan.slug, currentPlan);
          const isDowngrade = isLowerTier(plan.slug, currentPlan);
          const isPaid = plan.slug !== "discovery";

          return (
            <div
              key={plan.slug}
              className={`relative rounded-2xl p-5 border flex flex-col justify-between min-h-[168px] ${
                isCurrent
                  ? "border-emerald-500 bg-[#fafdfb]"
                  : "border-slate-100 bg-white"
              }`}
            >
              {isCurrent ? (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#006e2f] text-white px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider">
                  Current
                </div>
              ) : null}

              <div>
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    plan.highlight ? "text-emerald-600" : "text-slate-400"
                  }`}
                >
                  {plan.label}
                  {plan.slug === "scale" ? (
                    <Sparkles
                      size={10}
                      className="text-yellow-500 fill-yellow-500"
                    />
                  ) : null}
                </p>
                <p className="text-2xl font-extrabold text-slate-800 mt-2">
                  {plan.price}
                </p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  per month
                </p>
                {plan.detail ? (
                  <p className="text-xs text-slate-500 font-medium mt-2">
                    {plan.detail}
                  </p>
                ) : null}
              </div>

              {isCurrent ? (
                <button
                  type="button"
                  disabled
                  className="w-full h-10 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-white mt-4 disabled:opacity-70"
                >
                  Current plan
                </button>
              ) : isUpgrade && isPaid ? (
                <button
                  type="button"
                  disabled={isUpgrading}
                  onClick={() => onUpgrade(plan.slug)}
                  className={`w-full h-10 rounded-xl text-xs font-bold transition-colors mt-4 disabled:opacity-50 ${
                    plan.highlight
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-[#006e2f] hover:bg-[#005321] text-white"
                  }`}
                >
                  {isUpgrading ? "Redirecting..." : "Upgrade"}
                </button>
              ) : isDowngrade ? (
                <div className="mt-4 space-y-2">
                  <button
                    type="button"
                    disabled={isOpeningPortal}
                    onClick={onManageBilling}
                    className="w-full h-10 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    {isOpeningPortal ? "Opening..." : "Downgrade in Stripe"}
                  </button>
                  <p className="text-[10px] text-center font-medium text-slate-400 leading-snug">
                    Takes effect at period end
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full h-10 border border-slate-200 rounded-xl text-xs font-bold text-slate-400 bg-slate-50 mt-4"
                >
                  Free tier
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
