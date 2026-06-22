"use client";

import React from "react";
import { SubscriptionTier } from "@/types/employer/billing";
import { Check, AlertTriangle } from "lucide-react";

interface ActivePlanSidebarProps {
  currentPlan: SubscriptionTier;
  isCancelling: boolean;
  onCancel: () => void;
}

export function ActivePlanSidebar({ currentPlan, isCancelling, onCancel }: ActivePlanSidebarProps) {
  // Determine bullet points based on active plan
  const getFeatures = () => {
    switch (currentPlan) {
      case "professional":
        return [
          "Unlimited Job Posts",
          "Unlimited Candidate Unlocks",
          "Instant Verification",
          "Full Resume Downloads",
          "Dedicated Account Manager",
        ];
      case "essential":
      default:
        return [
          "Up to 3 Job Posts",
          "75 Candidate Unlocks",
          "Instant Approval",
          "Full Resumes",
        ];
    }
  };

  const planTitle = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);
  const features = getFeatures();

  return (
    <div className="space-y-6">
      {/* Plan Features Card */}
      <div className="bg-[#0a4a29] text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#22c55e]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-6 relative z-10">
          <div>
            <h3 className="text-lg font-bold">{planTitle} Plan Features</h3>
          </div>

          <ul className="space-y-4">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-3 text-sm font-medium text-emerald-100">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-white shrink-0">
                  <Check size={12} />
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="w-full h-11 bg-white hover:bg-slate-50 text-[#0a4a29] rounded-xl text-xs font-bold transition-all duration-200 shadow-sm mt-6"
          >
            Compare All Plans
          </button>
        </div>
      </div>

      {/* Cancel Subscription Card */}
      {currentPlan !== "discovery" && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center">
          <button
            type="button"
            disabled={isCancelling}
            onClick={() => {
              if (confirm("Are you sure you want to cancel your subscription? You will lose premium features at the end of your billing cycle.")) {
                onCancel();
              }
            }}
            className="w-full h-11 text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50/20 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <AlertTriangle size={14} />
            {isCancelling ? "Processing..." : "Cancel Subscription"}
          </button>
        </div>
      )}
    </div>
  );
}
