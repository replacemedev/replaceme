"use client";

import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { PricingPlan, SubscriptionTier } from "@/types/employer/billing";
import {
  isCurrentTier,
  isHigherTier,
  isLowerTier,
} from "@/lib/entitlements/ui-copy";

interface PricingCardsProps {
  plans: PricingPlan[];
  currentPlanSlug?: SubscriptionTier | null;
  onSelectPlan: (planSlug: string) => void;
}

function ctaLabel(
  plan: PricingPlan,
  currentPlanSlug: SubscriptionTier | null
): string {
  if (!currentPlanSlug) {
    return plan.ctaText;
  }
  if (isCurrentTier(plan.slug, currentPlanSlug)) {
    return "Your plan";
  }
  if (isLowerTier(plan.slug, currentPlanSlug)) {
    return "Manage in account";
  }
  return plan.ctaText;
}

export function PricingCards({
  plans,
  currentPlanSlug = null,
  onSelectPlan,
}: PricingCardsProps) {
  if (!plans || plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
        <p className="text-gray-500 font-medium text-lg">
          No pricing plans available at the moment.
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Please check back later or contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto px-4 py-8">
      {plans.map((plan) => {
        const isPopular = plan.popular;
        const isGrowth = plan.slug === "growth";
        const isScale = plan.slug === "scale";
        const isCurrent = currentPlanSlug
          ? isCurrentTier(plan.slug, currentPlanSlug)
          : false;
        const isUpgrade = currentPlanSlug
          ? isHigherTier(plan.slug, currentPlanSlug)
          : true;
        const isDowngrade = currentPlanSlug
          ? isLowerTier(plan.slug, currentPlanSlug)
          : false;

        return (
          <div
            key={plan.id}
            className={`relative flex flex-col justify-between p-6 rounded-2xl bg-white transition-all duration-300 ${
              isCurrent
                ? "border-2 border-[#006e2f] shadow-md ring-2 ring-[#006e2f]/10"
                : isPopular
                  ? "border-2 border-[#10b981] shadow-lg xl:-translate-y-2"
                  : "border border-gray-200 shadow-sm hover:shadow-md"
            }`}
          >
            {isCurrent ? (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#006e2f] text-white text-[10px] uppercase font-bold tracking-wider px-3.5 py-1 rounded-full whitespace-nowrap">
                Your plan
              </div>
            ) : isPopular ? (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#e6fbf2] border border-[#10b981] text-[#10b981] text-[10px] uppercase font-bold tracking-wider px-3.5 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                ★ Most Popular
              </div>
            ) : null}

            <div>
              <h3 className="text-lg font-bold text-gray-900 capitalize">
                {plan.name}
                {plan.slug === "discovery" ? (
                  <span className="text-sm font-normal text-gray-500 ml-1.5">
                    (Free)
                  </span>
                ) : null}
              </h3>
              <div className="mt-3 flex items-baseline">
                <span className="text-3xl font-extrabold text-gray-900">
                  ${plan.price}
                </span>
                <span className="text-gray-500 font-medium ml-1 text-sm">
                  /mo USD
                </span>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#e6fbf2] flex items-center justify-center mt-0.5">
                      <Check className="w-3.5 h-3.5 text-[#10b981] stroke-[3]" />
                    </div>
                    <span className="text-gray-600 text-xs font-medium leading-snug">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 space-y-2">
              {isCurrent ? (
                <Link
                  href="/employer/settings/account"
                  className="flex w-full items-center justify-center py-3 px-4 rounded-xl font-semibold text-sm border-2 border-[#006e2f] text-[#006e2f] bg-[#fafdfb] hover:bg-[#ebfdf2] transition-colors"
                >
                  Manage subscription
                </Link>
              ) : isDowngrade ? (
                <Link
                  href="/employer/settings/account"
                  className="flex w-full items-center justify-center py-3 px-4 rounded-xl font-semibold text-sm border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                >
                  {ctaLabel(plan, currentPlanSlug)}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelectPlan(plan.slug)}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
                    isGrowth && isUpgrade
                      ? "bg-[#10b981] text-white hover:bg-[#0d9668] shadow-sm hover:shadow"
                      : isScale && isUpgrade
                        ? "bg-white border border-[#10b981] text-[#10b981] hover:bg-[#e6fbf2]"
                        : plan.slug === "discovery"
                          ? "bg-[#e8edfb] text-[#5569ff] hover:bg-[#d8e0fa]"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {ctaLabel(plan, currentPlanSlug)}
                </button>
              )}
              {isDowngrade ? (
                <p className="text-[10px] text-center font-medium text-slate-400 leading-snug">
                  Downgrades apply at period end via Stripe billing portal.
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
