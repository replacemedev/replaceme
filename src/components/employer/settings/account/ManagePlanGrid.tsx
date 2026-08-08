"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SubscriptionTier } from "@/types/employer/billing";
import { Loader2, Sparkles, Star } from "lucide-react";
import { BillingIntervalToggle } from "@/components/employer/pricing/BillingIntervalToggle";
import {
  isCurrentTier,
  isHigherTier,
  isLowerTier,
  TIER_PRICES,
} from "@/lib/entitlements/ui-copy";
import {
  DEFAULT_BILLING_INTERVAL,
  TIER_ANNUAL_PRICES,
  TIER_ANNUAL_SAVE_PERCENT,
  displayMonthlyPrice,
  type BillingInterval,
} from "@/lib/pricing/billing-interval";
import { formatMoney } from "@/lib/format/currency";
import {
  PricingCardHeader,
  PricingCardPrice,
} from "@/components/employer/pricing/PricingCard";

interface ManagePlanGridProps {
  currentPlan: SubscriptionTier;
  /** Interval on the employer's live Stripe subscription (null if free / unknown). */
  currentBillingInterval?: BillingInterval | null;
  isUpgrading: boolean;
  isCancelling?: boolean;
  onUpgrade: (planId: SubscriptionTier, interval: BillingInterval) => void;
  onCancelToDiscovery?: () => void;
  onManageBilling: () => void;
  isOpeningPortal: boolean;
  nextBillingDate?: string | null;
  scheduledPlan?: SubscriptionTier | null;
  cancelAtPeriodEnd?: boolean;
}

const PLAN_META: {
  slug: SubscriptionTier;
  label: string;
  detail: string;
  highlight?: boolean;
}[] = [
  {
    slug: "discovery",
    label: "Discovery",
    detail: "1 job · preview candidates",
  },
  {
    slug: "starter",
    label: "Starter",
    detail: "3 jobs · 20 applicants/job",
  },
  {
    slug: "growth",
    label: "Growth",
    detail: "10 jobs · 50 applicants/job",
    highlight: true,
  },
  {
    slug: "scale",
    label: "Scale",
    detail: "Unlimited jobs & applicants",
  },
];

function paidSlug(
  slug: SubscriptionTier
): slug is "starter" | "growth" | "scale" {
  return slug === "starter" || slug === "growth" || slug === "scale";
}

export function ManagePlanGrid({
  currentPlan,
  currentBillingInterval = null,
  isUpgrading,
  isCancelling = false,
  onUpgrade,
  onCancelToDiscovery,
  onManageBilling,
  nextBillingDate,
  scheduledPlan = null,
  cancelAtPeriodEnd = false,
}: ManagePlanGridProps) {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(
    DEFAULT_BILLING_INTERVAL
  );

  return (
    <section
      id="manage-plan"
      className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm scroll-mt-24"
    >
      <div className="border-b border-slate-100 bg-gradient-to-br from-[#fafdfb] to-white p-5 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">
              Billing
            </p>
            <h2 className="mt-1 text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
              Manage plan
            </h2>
            <p className="mt-2 max-w-xl text-xs font-medium leading-relaxed text-slate-500">
              Toggle Annual or Monthly (Annual is default). Use it to upgrade,
              downgrade, or switch billing interval on your current plan.
              Upgrades apply immediately (prorated). Switching to a shorter
              interval or downgrading takes effect at period end.
            </p>
          </div>
          {nextBillingDate && currentPlan !== "discovery" ? (
            <p className="shrink-0 rounded-lg border border-slate-100 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-500 lg:text-right">
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

        <div className="mt-5 flex justify-center sm:mt-6">
          <BillingIntervalToggle
            value={billingInterval}
            onChange={setBillingInterval}
            className="w-full sm:w-auto"
          />
        </div>
      </div>

      <div className="p-5 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 w-full items-stretch">
          {PLAN_META.map((plan) => {
            const isCurrent = isCurrentTier(plan.slug, currentPlan);
            const isUpgrade = isHigherTier(plan.slug, currentPlan);
            const isDowngrade = isLowerTier(plan.slug, currentPlan);
            const paidKey = paidSlug(plan.slug) ? plan.slug : null;
            const isPaid = paidKey != null;
            const canSwitchInterval =
              isCurrent &&
              isPaid &&
              currentBillingInterval != null &&
              billingInterval !== currentBillingInterval;

            const shownPrice = paidKey
              ? displayMonthlyPrice(
                  TIER_PRICES[paidKey],
                  TIER_ANNUAL_PRICES[paidKey],
                  billingInterval
                )
              : 0;

            const annualTotal =
              paidKey && billingInterval === "year"
                ? TIER_ANNUAL_PRICES[paidKey]
                : null;

            const savePct =
              paidKey && billingInterval === "year"
                ? TIER_ANNUAL_SAVE_PERCENT[paidKey]
                : null;

            return (
              <div
                key={plan.slug}
                className={`relative flex h-full min-h-0 min-w-0 flex-col justify-between rounded-2xl border p-5 transition-all duration-200 sm:p-6 ${
                  isCurrent
                    ? "border-emerald-500 bg-[#fafdfb] shadow-sm"
                    : plan.highlight
                      ? "border-[#006e2f]/40 bg-gradient-to-b from-[#fafdfb] to-white shadow-sm hover:-translate-y-0.5 hover:shadow-md"
                      : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {isCurrent ? (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#006e2f] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                    Current
                  </div>
                ) : plan.highlight ? (
                  <div className="absolute -top-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full border border-[#006e2f] bg-[#e6fbf2] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#006e2f]">
                    <Star
                      className="h-2.5 w-2.5 fill-[#006e2f] stroke-[#006e2f]"
                      aria-hidden
                    />
                    Most Popular
                  </div>
                ) : null}

                <div className="min-w-0">
                  {/* Flex Header with Plan Label and Save Badge */}
                  <PricingCardHeader
                    title={
                      <h3 className="flex items-center gap-1.5 text-xl font-bold text-slate-900 capitalize whitespace-nowrap">
                        {plan.label}
                        {plan.slug === "scale" ? (
                          <Sparkles
                            size={16}
                            className="fill-yellow-500 text-yellow-500 shrink-0"
                            aria-hidden
                          />
                        ) : null}
                      </h3>
                    }
                    savePct={savePct}
                  />

                  {/* Streamlined Pricing Block */}
                  <PricingCardPrice
                    shownPrice={shownPrice}
                    annualTotal={annualTotal}
                    isPaid={isPaid}
                    billingInterval={billingInterval}
                    freeSubtext="Free forever"
                    priceClassName="text-3xl xl:text-4xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap"
                    centered
                  />

                  <p className="mt-2 text-[11px] sm:text-xs leading-relaxed text-slate-500 font-medium">
                    {plan.detail}
                  </p>
                </div>

                <div className="mt-auto pt-5">
                  {isCurrent && canSwitchInterval ? (
                    <button
                      type="button"
                      disabled={isUpgrading}
                      onClick={() => onUpgrade(plan.slug, billingInterval)}
                      className="flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#006e2f] px-3 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#005c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/40 disabled:opacity-50"
                    >
                      {isUpgrading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          Redirecting
                        </>
                      ) : (
                        "Switch"
                      )}
                    </button>
                  ) : isCurrent ? (
                    <button
                      type="button"
                      disabled
                      className="min-h-11 w-full whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-600 disabled:opacity-70"
                    >
                      Current
                    </button>
                  ) : isUpgrade && isPaid ? (
                    <button
                      type="button"
                      disabled={isUpgrading}
                      onClick={() => onUpgrade(plan.slug, billingInterval)}
                      className="flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#006e2f] px-3 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#005c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/40 disabled:opacity-50"
                    >
                      {isUpgrading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          Redirecting
                        </>
                      ) : (
                        "Upgrade"
                      )}
                    </button>
                  ) : isDowngrade ? (
                    isPaid ? (
                      <button
                        type="button"
                        disabled={isUpgrading || scheduledPlan === plan.slug}
                        onClick={() => onUpgrade(plan.slug, billingInterval)}
                        className="flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:opacity-50"
                      >
                        {scheduledPlan === plan.slug ? (
                          "Scheduled"
                        ) : isUpgrading ? (
                          <>
                            <Loader2
                              className="h-4 w-4 animate-spin"
                              aria-hidden
                            />
                            Redirecting
                          </>
                        ) : (
                          "Change"
                        )}
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
                        className="flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:opacity-50"
                      >
                        {cancelAtPeriodEnd || scheduledPlan === "discovery" ? (
                          "Scheduled"
                        ) : isCancelling ? (
                          <>
                            <Loader2
                              className="h-4 w-4 animate-spin"
                              aria-hidden
                            />
                            Redirecting
                          </>
                        ) : (
                          "Cancel"
                        )}
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="min-h-11 w-full whitespace-nowrap rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-400"
                    >
                      Free
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 border-t border-slate-100 bg-slate-50/50 p-4 text-center">
        <p className="mx-auto max-w-2xl text-[10px] font-semibold leading-relaxed text-slate-400">
          Prices are tax-exclusive USD. Annual plans are prepaid for 12 months
          (shown as a monthly equivalent). Tax is calculated at Stripe Checkout.
          Cancel anytime online access continues until period end.{" "}
          <Link
            href="/refund-policy"
            className="font-semibold text-[#006e2f] hover:underline"
          >
            Refund Policy
          </Link>
          .
        </p>
        <Link
          href="/employer/pricing"
          className="inline-flex min-h-10 items-center justify-center text-xs font-bold text-[#006e2f] hover:underline"
        >
          Compare all features
        </Link>
      </div>
    </section>
  );
}
