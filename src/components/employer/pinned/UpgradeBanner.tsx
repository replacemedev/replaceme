"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export function UpgradeBanner() {
  return (
    <div className="bg-[#ebfdf2]/40 border border-[#006e2f]/20 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm mb-8 animate-fadeIn">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#ebfdf2] flex items-center justify-center text-[#006e2f] shrink-0">
          <Sparkles size={24} className="animate-pulse" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 mb-1">
            Upgrade to Professional Plan
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl font-medium">
            Unlock unlimited pinned profiles, full candidate contact details, direct messaging without restrictions, and premium support. Elevate your hiring experience.
          </p>
        </div>
      </div>
      <Link
        href="/employer/pricing"
        className="h-11 px-5 bg-[#006e2f] hover:bg-[#005c26] text-white font-bold text-xs rounded-2xl transition-colors flex items-center gap-2 shrink-0 shadow-sm cursor-pointer"
      >
        Upgrade Now
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
