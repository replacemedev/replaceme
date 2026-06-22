"use client";

import React from "react";
import { SubscriptionTier } from "@/types/employer/billing";
import { Sparkles } from "lucide-react";

interface ManagePlanGridProps {
  currentPlan: SubscriptionTier;
  isUpgrading: boolean;
  onUpgrade: (planId: SubscriptionTier) => void;
}

export function ManagePlanGrid({ currentPlan, isUpgrading, onUpgrade }: ManagePlanGridProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Manage Plan</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Discovery Plan Card */}
        <div className={`relative rounded-2xl p-5 border flex flex-col justify-between min-h-[160px] ${
          currentPlan === "discovery"
            ? "border-emerald-500 bg-[#fafdfb]"
            : "border-slate-100 bg-white"
        }`}>
          {currentPlan === "discovery" && (
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#006e2f] text-white px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider">
              Current
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discovery</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-2">$0</p>
          </div>
          <button
            type="button"
            className="w-full h-10 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 transition-colors mt-4"
          >
            View Details
          </button>
        </div>

        {/* Essential Plan Card */}
        <div className={`relative rounded-2xl p-5 border flex flex-col justify-between min-h-[160px] ${
          currentPlan === "essential"
            ? "border-[#22c55e] border-2 bg-[#fafdfb]"
            : "border-slate-100 bg-white"
        }`}>
          {currentPlan === "essential" && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#006e2f] text-white px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider">
              Current
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Essential</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-2">$49</p>
            <p className="text-xs text-slate-500 font-medium mt-1">75 Unlocks/mo</p>
          </div>
          {currentPlan !== "essential" && (
            <button
              type="button"
              disabled={isUpgrading}
              onClick={() => onUpgrade("essential")}
              className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors mt-4 disabled:opacity-50"
            >
              Select Plan
            </button>
          )}
        </div>

        {/* Professional Plan Card */}
        <div className={`relative rounded-2xl p-5 border flex flex-col justify-between min-h-[160px] ${
          currentPlan === "professional"
            ? "border-[#22c55e] border-2 bg-[#fafdfb]"
            : "border-slate-100 bg-white"
        }`}>
          {currentPlan === "professional" && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#006e2f] text-white px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider">
              Current
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              Professional
              <Sparkles size={10} className="text-yellow-500 fill-yellow-500" />
            </p>
            <p className="text-2xl font-extrabold text-slate-800 mt-2">$99</p>
          </div>
          {currentPlan !== "professional" && (
            <button
              type="button"
              disabled={isUpgrading}
              onClick={() => onUpgrade("professional")}
              className="w-full h-10 bg-[#006e2f] hover:bg-[#005321] text-white rounded-xl text-xs font-bold transition-colors mt-4 disabled:opacity-50"
            >
              {isUpgrading ? "Upgrading..." : "Upgrade"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
