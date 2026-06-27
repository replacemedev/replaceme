import React from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface ProfileStrengthCardProps {
  percentage: number;
  tierLabel?: string;
}

export function ProfileStrengthCard({
  percentage,
  tierLabel = "Growing",
}: ProfileStrengthCardProps) {
  return (
    <div className="flex flex-col justify-between p-6 bg-white border border-slate-200 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-xs gap-4 relative overflow-hidden select-none">
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Profile Strength
        </h3>
        <p className="text-xs text-slate-500 font-medium leading-normal">
          Complete your profile to unlock more tailored job opportunities.
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-bold tracking-tight">
          <span className="text-[#006e2f]">{percentage}%</span>
          <span className="text-slate-500">{tierLabel}</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-[#006e2f] h-full rounded-full transition-all duration-500" 
            style={{ width: `${percentage}%` }} 
          />
        </div>
      </div>

      <Link
        href="/worker/profile"
        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-white bg-[#006e2f] hover:bg-[#005c26] active:bg-[#00421a] rounded-xl transition-all duration-150 shadow-xs cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 focus-visible:ring-offset-2"
      >
        Complete Profile
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
