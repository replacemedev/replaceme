"use client";

import React from "react";
import { CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/format/currency";

interface CompensationCardProps {
  hourlyRate: number;
  monthlySalary: number;
  hoursPerWeek: number;
  salaryCurrency?: string;
}

export function CompensationCard({
  hourlyRate,
  monthlySalary,
  hoursPerWeek,
  salaryCurrency = "PHP",
}: CompensationCardProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-emerald-600">
          <CreditCard size={20} />
        </span>
        <h2 className="text-sm font-bold text-slate-800">Compensation</h2>
      </div>

      <div className="space-y-3">
        {/* Primary: Hourly Rate */}
        <div>
          <p className="text-2xl font-extrabold text-[#22c55e]">
            {formatCurrency(hourlyRate, salaryCurrency, {
              maximumFractionDigits: 0,
              asReact: true,
              perHour: true,
              codeClassName: "text-slate-500 text-sm ml-1 font-semibold",
            })}
          </p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Hourly rate · {hoursPerWeek} hrs/week
          </p>
        </div>

        {/* Secondary: Estimated monthly */}
        <div className="pt-3 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Est. Monthly
          </p>
          <p className="text-base font-extrabold text-slate-700 mt-0.5">
            {formatCurrency(monthlySalary, salaryCurrency, {
              maximumFractionDigits: 0,
              asReact: true,
              codeClassName: "text-slate-400 text-xs ml-1 font-semibold",
            })}
            <span className="text-xs font-normal text-slate-400">/month</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Based on {hoursPerWeek} hrs/week × 4 weeks
          </p>
        </div>
      </div>
    </div>
  );
}
