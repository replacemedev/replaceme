import React from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface ProfileStrengthCardProps {
  percentage: number;
}

export function ProfileStrengthCard({ percentage }: ProfileStrengthCardProps) {
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
          <span className="text-[#22c55e]">{percentage}%</span>
          <span className="text-slate-500">Intermediate</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-[#22c55e] h-full rounded-full transition-all duration-500" 
            style={{ width: `${percentage}%` }} 
          />
        </div>
      </div>

      <Link
        href="/profile/edit"
        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-white bg-[#22c55e] hover:bg-[#16a34a] rounded-xl transition-all duration-150 shadow-xs cursor-pointer select-none"
      >
        Complete Profile
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
