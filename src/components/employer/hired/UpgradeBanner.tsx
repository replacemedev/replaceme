"use client";

import React from "react";
import Link from "next/link";
import { Rocket, CheckCircle2 } from "lucide-react";

export function UpgradeBanner() {
  return (
    <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 shadow-sm mb-8 animate-fadeIn">
      {/* Left Info Column */}
      <div className="flex items-start gap-4 flex-1">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-[#16a34a] shrink-0">
          <Rocket size={24} className="fill-[#16a34a]" />
        </div>
        <div className="space-y-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 mb-1">
              Upgrade to Professional
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Unlock your hiring potential with unlimited access and priority support.
            </p>
          </div>
          {/* 3 Checkmarks */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold">
              <CheckCircle2 size={14} className="text-[#16a34a] fill-emerald-100" />
              Unlimited Job Posts
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold">
              <CheckCircle2 size={14} className="text-[#16a34a] fill-emerald-100" />
              Unlimited Candidate Contact
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold">
              <CheckCircle2 size={14} className="text-[#16a34a] fill-emerald-100" />
              Priority Support
            </div>
          </div>
        </div>
      </div>

      {/* Right Pricing Column */}
      <div className="flex md:flex-col items-center justify-between md:justify-center md:items-end gap-3 border-t md:border-t-0 border-emerald-100/50 pt-4 md:pt-0 shrink-0">
        <div className="text-left md:text-right">
          <span className="text-2xl font-black text-slate-800">$99</span>
          <span className="text-xs text-slate-400 font-bold">/mo</span>
        </div>
        <Link
          href="/pricing"
          className="h-11 px-6 bg-[#006e2f] hover:bg-[#005c26] text-white font-bold text-xs rounded-2xl transition-colors flex items-center justify-center shadow-sm cursor-pointer"
        >
          Upgrade Now
        </Link>
      </div>
    </div>
  );
}
