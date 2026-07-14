"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { PricingPlan, SubscriptionTier } from "@/types/employer/billing";
import { isCurrentTier } from "@/lib/entitlements/ui-copy";

interface CompareTableProps {
  plans: PricingPlan[];
  currentPlanSlug?: SubscriptionTier | null;
}

export function CompareTable({
  plans,
  currentPlanSlug = null,
}: CompareTableProps) {
  if (!plans || plans.length === 0) {
    return null;
  }

  const ordered = [...plans].sort((a, b) => a.price - b.price);

  const rows: {
    feature: string;
    values: Record<string, string>;
    highlight?: boolean;
  }[] = [
    {
      feature: "Active Job Posts",
      values: {
        discovery: "1",
        starter: "3",
        growth: "10",
        scale: "Unlimited",
      },
    },
    {
      feature: "Applicants per Job",
      values: {
        discovery: "10",
        starter: "20",
        growth: "50",
        scale: "Unlimited",
      },
    },
    {
      feature: "Job Approval Time",
      values: {
        discovery: "2-Day",
        starter: "Instant",
        growth: "Instant",
        scale: "Instant",
      },
      highlight: true,
    },
    {
      feature: "Candidate Profiles",
      values: {
        discovery: "Anonymous",
        starter: "Full",
        growth: "Full",
        scale: "Full",
      },
    },
    {
      feature: "Resume Downloads",
      values: {
        discovery: "x",
        starter: "check",
        growth: "check",
        scale: "check",
      },
    },
    {
      feature: "Direct Messaging",
      values: {
        discovery: "x",
        starter: "check",
        growth: "check",
        scale: "check",
      },
    },
    {
      feature: "Priority Job Listing",
      values: {
        discovery: "x",
        starter: "x",
        growth: "check",
        scale: "check",
      },
    },
    {
      feature: "Support",
      values: {
        discovery: "None",
        starter: "Email",
        growth: "Email",
        scale: "Priority",
      },
    },
    {
      feature: "Early Access to Features",
      values: {
        discovery: "x",
        starter: "x",
        growth: "x",
        scale: "check",
      },
    },
  ];

  const renderCell = (val: string, isHighlight = false) => {
    if (val === "check") {
      return (
        <div className="flex justify-center">
          <Check className="w-4 h-4 text-[#006e2f] stroke-[3.5] shrink-0" />
        </div>
      );
    }
    if (val === "x") {
      return (
        <div className="flex justify-center">
          <span className="text-gray-300 font-medium">—</span>
        </div>
      );
    }
    if (val === "Instant" && isHighlight) {
      return <span className="text-[#006e2f] font-semibold">{val}</span>;
    }
    return <span className="text-slate-600 font-medium">{val}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
        Compare Features
      </h3>
      <p className="text-center text-sm text-slate-500 font-medium mb-10 max-w-xl mx-auto">
        {currentPlanSlug
          ? "All paid plans bill monthly in USD through Stripe. Your current plan is highlighted below."
          : "All paid plans bill monthly in USD through Stripe. Compare tiers and sign up when you're ready."}
      </p>
      <div className="overflow-x-auto pb-4" style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}>
        <div className="overflow-hidden rounded-xl shadow-sm ring-1 ring-gray-900/5 bg-white min-w-[640px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="p-4 text-sm font-semibold text-gray-500 w-[18%]">
                  Feature
                </th>
                {ordered.map((plan) => {
                  const isCurrent = currentPlanSlug
                    ? isCurrentTier(plan.slug, currentPlanSlug)
                    : false;
                  const isGrowth = plan.slug.toLowerCase() === "growth";
                  return (
                    <th
                      key={plan.id}
                      className={`p-4 text-sm font-semibold text-center border-t-2 transition-all ${
                        isGrowth
                          ? "border-t-[#006e2f] bg-green-50/30 text-[#006e2f] font-bold"
                          : isCurrent
                            ? "border-t-transparent bg-[#fafdfb] text-[#006e2f]"
                            : "border-t-transparent text-gray-900"
                      }`}
                    >
                      <span className="block">{plan.name}</span>
                      {isCurrent ? (
                        <span className="mt-1 inline-block rounded-full bg-[#006e2f] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                          Current
                        </span>
                      ) : null}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <tr
                  key={row.feature}
                  className="group hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 text-sm font-medium text-slate-900 w-[18%]">
                    {row.feature}
                  </td>
                  {ordered.map((plan) => {
                    const isCurrent = currentPlanSlug
                      ? isCurrentTier(plan.slug, currentPlanSlug)
                      : false;
                    const isGrowth = plan.slug.toLowerCase() === "growth";
                    return (
                      <td
                        key={plan.id}
                        className={`p-4 text-sm text-center transition-colors ${
                          isGrowth
                            ? "bg-green-50/30 group-hover:bg-green-100/20"
                            : isCurrent
                              ? "bg-[#fafdfb]/60 group-hover:bg-[#fafdfb]/30"
                              : ""
                        }`}
                      >
                        {renderCell(row.values[plan.slug.toLowerCase()] ?? "—", row.highlight)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
