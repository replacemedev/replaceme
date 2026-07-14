"use client";

import React from "react";
import Link from "next/link";
import { Check, X, Star } from "lucide-react";
import { PricingPlan, SubscriptionTier } from "@/types/employer/billing";
import {
  isCurrentTier,
  isLowerTier,
} from "@/lib/entitlements/ui-copy";
import { formatMoney } from "@/lib/format/currency";

interface PricingCardsProps {
  plans: PricingPlan[];
  currentPlanSlug?: SubscriptionTier | null;
  onSelectPlan: (planSlug: string) => void;
}

interface TierDetail {
  description: string;
  descriptionLabel: "Purpose" | "Perfect for";
  features: { text: string; included: boolean }[];
  ctaText: string;
}

const TIER_DETAILS: Record<string, TierDetail> = {
  discovery: {
    description: "Allow employers to experience the platform while requiring an upgrade to actually hire someone.",
    descriptionLabel: "Purpose",
    features: [
      { text: "1 Active Job Post", included: true },
      { text: "Up to 10 Applicants", included: true },
      { text: "2-Day Approval Time", included: true },
      { text: "Anonymous Candidate Previews", included: true },
      { text: "Skills, Experience & Salary Visible", included: true },
      { text: "Names, Contact Details & Resume Locked", included: true },
      { text: "No Messaging", included: false },
      { text: "No Resume Downloads", included: false },
    ],
    ctaText: "Post a Job for Free",
  },
  starter: {
    description: "Small businesses hiring one or two remote workers.",
    descriptionLabel: "Perfect for",
    features: [
      { text: "Up to 3 Active Job Posts", included: true },
      { text: "Up to 20 Applicants Per Job", included: true },
      { text: "Instant Job Approval", included: true },
      { text: "Full Candidate Profiles", included: true },
      { text: "Resume Downloads", included: true },
      { text: "Direct Messaging", included: true },
      { text: "Email Support", included: true },
    ],
    ctaText: "Start Hiring",
  },
  growth: {
    description: "Growing businesses regularly hiring remote staff.",
    descriptionLabel: "Perfect for",
    features: [
      { text: "Up to 10 Active Job Posts", included: true },
      { text: "Up to 50 Applicants Per Job", included: true },
      { text: "Instant Job Approval", included: true },
      { text: "Full Candidate Profiles", included: true },
      { text: "Resume Downloads", included: true },
      { text: "Direct Messaging", included: true },
      { text: "Priority Listing for Job Posts", included: true },
    ],
    ctaText: "Grow Your Team",
  },
  scale: {
    description: "Recruitment agencies and businesses building larger remote teams",
    descriptionLabel: "Perfect for",
    features: [
      { text: "Unlimited Active Job Posts", included: true },
      { text: "Unlimited Applicants", included: true },
      { text: "Unlimited Messaging", included: true },
      { text: "Full Candidate Profiles", included: true },
      { text: "Resume Downloads", included: true },
      { text: "Instant Job Approval", included: true },
      { text: "Priority Support", included: true },
      { text: "Early Access to New Features", included: true },
    ],
    ctaText: "Scale Your Team",
  },
};

const TIER_ORDER = ["discovery", "starter", "growth", "scale"];

function ctaLabel(
  planSlug: string,
  currentPlanSlug: SubscriptionTier | null,
  fallbackText: string
): string {
  if (!currentPlanSlug) {
    return fallbackText;
  }
  if (isCurrentTier(planSlug, currentPlanSlug)) {
    return "Your plan";
  }
  if (isLowerTier(planSlug, currentPlanSlug)) {
    return "Manage in account";
  }
  return fallbackText;
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

  // Ensure plans are sorted in Discovery -> Starter -> Growth -> Scale order
  const orderedPlans = [...plans].sort((a, b) => {
    return TIER_ORDER.indexOf(a.slug.toLowerCase()) - TIER_ORDER.indexOf(b.slug.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {orderedPlans.map((plan) => {
          const slug = plan.slug.toLowerCase();
          const detail = TIER_DETAILS[slug] || {
            description: "",
            descriptionLabel: "Perfect for",
            features: plan.features.map(f => ({ text: f, included: true })),
            ctaText: plan.ctaText
          };

          const isGrowth = slug === "growth";
          const isCurrent = currentPlanSlug
            ? isCurrentTier(slug, currentPlanSlug)
            : false;
          const isDowngrade = currentPlanSlug
            ? isLowerTier(slug, currentPlanSlug)
            : false;

          const buttonText = ctaLabel(slug, currentPlanSlug, detail.ctaText);

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between p-6 rounded-2xl transition-all duration-300 ${
                isGrowth
                  ? "border-2 border-[#006e2f] bg-gradient-to-b from-[#fafdfb] to-white shadow-lg lg:scale-105 z-10 hover:shadow-xl"
                  : "border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-gray-300"
              }`}
            >
              {/* Badge Pinned to the Top */}
              {isCurrent ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#006e2f] text-white text-[10px] uppercase font-extrabold tracking-wider px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
                  Active Plan
                </div>
              ) : isGrowth ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#e6fbf2] border border-[#006e2f] text-[#006e2f] text-[10px] uppercase font-bold tracking-wider px-3.5 py-1 rounded-full flex items-center gap-1 whitespace-nowrap shadow-xs">
                  <Star className="h-3 w-3 fill-[#006e2f] stroke-[#006e2f]" aria-hidden />
                  Most Popular
                </div>
              ) : slug === "discovery" ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full whitespace-nowrap">
                  Free Forever
                </div>
              ) : null}

              <div className="flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 capitalize flex items-center justify-between">
                  <span>{plan.name}</span>
                </h3>

                {/* Price Display */}
                <div className="mt-3 flex items-baseline">
                  <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
                    {formatMoney(plan.price, "USD", {
                      asReact: true,
                      codeClassName: "text-gray-500 text-sm font-semibold ml-1",
                    })}
                  </span>
                  <span className="text-gray-500 font-medium ml-1 text-sm">
                    /month
                  </span>
                </div>

                {/* Description (Purpose/Perfect for) */}
                <div className="mt-4 min-h-[50px] flex flex-col justify-start">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {detail.descriptionLabel}
                  </p>
                  <p className="text-slate-500 text-sm mt-1 leading-relaxed font-medium">
                    {detail.description}
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-5" />

                {/* Features List */}
                <ul className="space-y-3 flex-1">
                  {detail.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      {feature.included ? (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#e6fbf2] flex items-center justify-center mt-0.5">
                          <Check className="w-3.5 h-3.5 text-[#006e2f] stroke-[3]" />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-50 flex items-center justify-center mt-0.5">
                          <X className="w-3.5 h-3.5 text-red-500 stroke-[3]" />
                        </div>
                      )}
                      <span
                        className={`text-xs font-medium leading-snug ${
                          feature.included ? "text-gray-700" : "text-gray-400 line-through"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Call to Action Button */}
              <div className="mt-8 space-y-2">
                {isCurrent ? (
                  <Link
                    href="/employer/settings/account"
                    className="flex w-full items-center justify-center py-3 px-4 rounded-xl font-bold text-sm border-2 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs"
                  >
                    Manage Subscription
                  </Link>
                ) : isDowngrade ? (
                  <Link
                    href="/employer/settings/account"
                    className="flex w-full items-center justify-center py-3 px-4 rounded-xl font-bold text-sm border-2 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs"
                  >
                    {buttonText}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectPlan(plan.slug)}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer flex items-center justify-center ${
                      isGrowth
                        ? "bg-[#006e2f] text-white hover:bg-[#005c26] shadow-sm hover:shadow"
                        : "border-2 border-slate-200 text-slate-800 bg-white hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    {buttonText}
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
      <p className="text-center text-xs text-slate-400 font-semibold max-w-xl mx-auto leading-relaxed pt-4">
        All prices are billed exclusively in USD through Stripe. Cancel anytime.
      </p>
    </div>
  );
}
