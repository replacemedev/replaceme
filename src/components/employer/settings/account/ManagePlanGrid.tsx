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
  isCancelling?: boolean;
  onUpgrade: (planId: SubscriptionTier) => void;
  onCancelToDiscovery?: () => void;
  onManageBilling: () => void;
  isOpeningPortal: boolean;
  nextBillingDate?: string | null;
  scheduledPlan?: SubscriptionTier | null;
  cancelAtPeriodEnd?: boolean;
}

const UPGRADE_PLANS: {
  slug: SubscriptionTier;
  label: string;
  price: number;
  detail?: string;
  highlight?: boolean;
}[] = [
  { slug: "discovery", label: "Discovery", price: 0 },
  {
    slug: "starter",
    label: "Starter",
    price: 19,
    detail: "3 jobs · 20 applicants/job",
  },
  {
    slug: "growth",
    label: "Growth",
    price: 39,
    detail: "10 jobs · 50 applicants/job",
    highlight: true,
  },
  {
    slug: "scale",
    label: "Scale",
    price: 79,
    detail: "Unlimited jobs & applicants",
  },
];

export function ManagePlanGrid({
  currentPlan,
  isUpgrading,
  isCancelling = false,
  onUpgrade,
  onCancelToDiscovery,
  onManageBilling,
  isOpeningPortal,
  nextBillingDate,
  scheduledPlan = null,
  cancelAtPeriodEnd = false,
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
              Upgrades take effect immediately with proration. Downgrades are
              scheduled for the end of your billing period — you keep your
              current plan until then.
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {UPGRADE_PLANS.map((plan) => {
          const isCurrent = isCurrentTier(plan.slug, currentPlan);
          const isUpgrade = isHigherTier(plan.slug, currentPlan);
          const isDowngrade = isLowerTier(plan.slug, currentPlan);
          const isPaid = plan.slug !== "discovery";

          return (
            <div
              key={plan.slug}
              className={`relative flex min-h-0 flex-col justify-between rounded-xl border p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                isCurrent
                  ? "border-emerald-500 bg-[#fafdfb] shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              {isCurrent ? (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#006e2f] text-white px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider">
                  Current
                </div>
              ) : null}

              <div>
                <p
                  className={`text-[10px] sm:text-xs font-bold tracking-wider uppercase flex items-center gap-1 ${
                    plan.highlight ? "text-emerald-600" : "text-slate-500"
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
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 flex items-baseline">
                  ${plan.price}
                  <span className="text-sm sm:text-base font-semibold text-slate-500 ml-1">
                    USD
                  </span>
                </p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  per month
                </p>
                {plan.detail ? (
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {plan.detail}
                  </p>
                ) : null}
              </div>

              {isCurrent ? (
                <button
                  type="button"
                  disabled
                  className="w-full min-h-[44px] py-2 px-4 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 bg-white mt-4 disabled:opacity-70 transition-colors"
                >
                  Current plan
                </button>
              ) : isUpgrade && isPaid ? (
                <button
                  type="button"
                  disabled={isUpgrading}
                  onClick={() => onUpgrade(plan.slug)}
                  className={`w-full min-h-[44px] py-2 px-4 rounded-lg text-sm font-medium transition-colors mt-4 disabled:opacity-50 ${
                    plan.highlight
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      : "bg-[#006e2f] hover:bg-[#005c26] text-white shadow-sm"
                  }`}
                >
                  {isUpgrading ? "Redirecting..." : "Upgrade"}
                </button>
              ) : isDowngrade ? (
                <div className="mt-4 space-y-2">
                  {isPaid ? (
                    <button
                      type="button"
                      disabled={
                        isUpgrading ||
                        scheduledPlan === plan.slug
                      }
                      onClick={() => onUpgrade(plan.slug)}
                      className="w-full min-h-[44px] py-2 px-4 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      {scheduledPlan === plan.slug
                        ? "Scheduled"
                        : isUpgrading
                          ? "Scheduling..."
                          : "Schedule downgrade"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={
                        isCancelling ||
                        cancelAtPeriodEnd ||
                        scheduledPlan === "discovery"
                      }
                      onClick={() =>
                        onCancelToDiscovery
                          ? onCancelToDiscovery()
                          : onManageBilling()
                      }
                      className="w-full min-h-[44px] py-2 px-4 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      {cancelAtPeriodEnd || scheduledPlan === "discovery"
                        ? "Scheduled"
                        : isCancelling
                          ? "Scheduling..."
                          : "Move to Discovery"}
                    </button>
                  )}
                  <p className="text-[10px] text-center font-medium text-slate-400 leading-snug">
                    Takes effect at period end
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full min-h-[44px] py-2 px-4 border border-slate-200 rounded-lg text-sm font-medium text-slate-400 bg-slate-50 mt-4"
                >
                  Free tier
                </button>
              )}
            </div>
          );
        })}
      </div>
      </div>
      <div className="border-t border-slate-100 bg-slate-50/50 p-4 text-center">
        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
          All prices are billed exclusively in USD (United States Dollars) through Stripe. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
