"use client";

import React from "react";
import { CreditCard } from "lucide-react";

interface CompensationCardProps {
  monthlySalary: number;
  hoursPerWeek: number;
}

export function CompensationCard({ monthlySalary, hoursPerWeek }: CompensationCardProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-emerald-600">
          <CreditCard size={20} />
        </span>
        <h2 className="text-sm font-bold text-slate-800">Compensation</h2>
      </div>

      <div className="space-y-1">
        <p className="text-2xl font-extrabold text-[#22c55e]">
          ${monthlySalary.toLocaleString()} <span className="text-sm font-normal text-slate-500">/ month</span>
        </p>
        <p className="text-xs text-slate-400 leading-normal font-medium">
          Fixed monthly retainer based on {hoursPerWeek} hours/week.
        </p>
      </div>
    </div>
  );
}
