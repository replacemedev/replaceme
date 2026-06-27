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
      feature: "Job Posts",
      values: Object.fromEntries(
        ordered.map((p) => [
          p.slug,
          p.limits.jobs === "1" ? "1" : p.limits.jobs,
        ])
      ),
    },
    {
      feature: "Applicants per Job",
      values: Object.fromEntries(
        ordered.map((p) => [p.slug, p.limits.applicants])
      ),
    },
    {
      feature: "Approval Time",
      values: Object.fromEntries(
        ordered.map((p) => [p.slug, p.limits.approval])
      ),
      highlight: true,
    },
    {
      feature: "Candidate Profiles",
      values: Object.fromEntries(
        ordered.map((p) => [p.slug, p.limits.viewIdentities])
      ),
    },
    {
      feature: "Messaging",
      values: Object.fromEntries(
        ordered.map((p) => [
          p.slug,
          p.limits.messaging === "Yes" ? "check" : "x",
        ])
      ),
    },
    {
      feature: "Resume Downloads",
      values: Object.fromEntries(
        ordered.map((p) => [
          p.slug,
          p.limits.resumeDownload === "Yes" ? "check" : "x",
        ])
      ),
    },
    {
      feature: "Priority Listing",
      values: Object.fromEntries(
        ordered.map((p) => [
          p.slug,
          p.limits.priorityListing === "Yes" ? "check" : "x",
        ])
      ),
    },
    {
      feature: "Priority Support",
      values: Object.fromEntries(
        ordered.map((p) => [
          p.slug,
          p.limits.prioritySupport === "Yes" ? "check" : "x",
        ])
      ),
    },
  ];

  const renderCell = (val: string, isHighlight = false) => {
    if (val === "check") {
      return (
        <div className="flex justify-center">
          <Check className="w-5 h-5 text-[#10b981] stroke-[3]" />
        </div>
      );
    }
    if (val === "x") {
      return (
        <div className="flex justify-center">
          <X className="w-5 h-5 text-red-500 stroke-[3]" />
        </div>
      );
    }
    if (val === "Instant" && isHighlight) {
      return <span className="text-[#10b981] font-semibold">{val}</span>;
    }
    return <span className="text-gray-700 font-medium">{val}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 overflow-x-auto">
      <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
        Compare Features
      </h3>
      <p className="text-center text-sm text-slate-500 font-medium mb-10 max-w-xl mx-auto">
        {currentPlanSlug
          ? "All paid plans bill monthly in USD through Stripe. Your current plan is highlighted below."
          : "All paid plans bill monthly in USD through Stripe. Compare tiers and sign up when you're ready."}
      </p>
      <div className="rounded-2xl border border-gray-100 shadow-sm bg-white min-w-[640px]">
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
                return (
                  <th
                    key={plan.id}
                    className={`p-4 text-sm font-semibold text-center ${
                      isCurrent
                        ? "text-[#006e2f] bg-[#fafdfb]"
                        : plan.popular
                          ? "text-[#10b981]"
                          : "text-gray-900"
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
          <tbody className="divide-y divide-gray-50">
            {rows.map((row) => (
              <tr
                key={row.feature}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="p-4 text-sm font-semibold text-gray-600">
                  {row.feature}
                </td>
                {ordered.map((plan) => {
                  const isCurrent = currentPlanSlug
                  ? isCurrentTier(plan.slug, currentPlanSlug)
                  : false;
                  return (
                    <td
                      key={plan.id}
                      className={`p-4 text-sm text-center ${
                        isCurrent ? "bg-[#fafdfb]/60" : ""
                      }`}
                    >
                      {renderCell(row.values[plan.slug] ?? "—", row.highlight)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
