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
    <section
      id="manage-plan"
      className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm scroll-mt-24"
    >
      <div className="border-b border-slate-100 bg-gradient-to-br from-[#fafdfb] to-white p-6 sm:p-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">
              Billing
            </p>
            <h2 className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">
              Manage plan
            </h2>
            <p className="mt-2 max-w-xl text-xs font-medium leading-relaxed text-slate-500">
              Upgrades take effect immediately. Downgrades apply at the end of
              your billing period via the Stripe billing portal.
            </p>
          </div>
          {nextBillingDate && currentPlan !== "discovery" ? (
            <p className="shrink-0 text-xs font-semibold text-slate-500 lg:text-right">
              Next billing:{" "}
              <span className="whitespace-nowrap text-slate-800">
                {new Date(nextBillingDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </p>
          ) : null}
        </div>
      </div>

      <div className="p-6 sm:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {UPGRADE_PLANS.map((plan) => {
          const isCurrent = isCurrentTier(plan.slug, currentPlan);
          const isUpgrade = isHigherTier(plan.slug, currentPlan);
          const isDowngrade = isLowerTier(plan.slug, currentPlan);
          const isPaid = plan.slug !== "discovery";

          return (
            <div
              key={plan.slug}
              className={`relative flex min-h-0 flex-col justify-between rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                isCurrent
                  ? "border-emerald-500 bg-[#fafdfb] shadow-sm"
                  : "border-slate-100 bg-white hover:border-slate-200"
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
                  className="w-full min-h-[44px] border border-slate-200 rounded-xl text-xs font-extrabold text-slate-600 bg-white mt-4 disabled:opacity-70"
                >
                  Current plan
                </button>
              ) : isUpgrade && isPaid ? (
                <button
                  type="button"
                  disabled={isUpgrading}
                  onClick={() => onUpgrade(plan.slug)}
                  className={`w-full min-h-[44px] rounded-xl text-xs font-extrabold transition-colors mt-4 disabled:opacity-50 ${
                    plan.highlight
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      : "bg-[#006e2f] hover:bg-[#005321] text-white shadow-sm"
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
                    className="w-full min-h-[44px] border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
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
                  className="w-full min-h-[44px] border border-slate-200 rounded-xl text-xs font-extrabold text-slate-400 bg-slate-50 mt-4"
                >
                  Free tier
                </button>
              )}
            </div>
          );
        })}
      </div>
      </div>
    </section>
  );
}
