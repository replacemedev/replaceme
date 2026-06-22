"use client";

import React from "react";
import { Users, CreditCard, Calendar } from "lucide-react";
import { HiredStats } from "@/types/employer/hired";

interface StatsOverviewProps {
  stats: HiredStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  // Format payroll value cleanly to currency format e.g. $52,400
  const formattedPayroll = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(stats.monthlyPayroll);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fadeIn">
      {/* Total Active Workers Card */}
      <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-3xl p-6 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-[10px] font-black text-emerald-800/80 uppercase tracking-widest leading-none block mb-2">
            Total Active
          </span>
          <span className="text-2xl font-black text-emerald-800 leading-none">
            {stats.totalActive} {stats.totalActive === 1 ? "Worker" : "Workers"}
          </span>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
          <Users size={22} className="fill-emerald-100" />
        </div>
      </div>

      {/* Monthly Payroll Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none block mb-2">
            Monthly Payroll
          </span>
          <span className="text-2xl font-black text-slate-800 leading-none">
            {formattedPayroll}
          </span>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
          <CreditCard size={22} />
        </div>
      </div>

      {/* Average Tenure Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none block mb-2">
            Average Tenure
          </span>
          <span className="text-2xl font-black text-slate-800 leading-none">
            {stats.averageTenure} {stats.averageTenure === 1 ? "Month" : "Months"}
          </span>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
          <Calendar size={22} />
        </div>
      </div>
    </div>
  );
}
