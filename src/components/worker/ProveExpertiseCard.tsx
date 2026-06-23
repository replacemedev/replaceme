import React from "react";
import Link from "next/link";
import { Award, CheckCircle } from "lucide-react";

export function ProveExpertiseCard() {
  return (
    <div className="relative p-6 bg-white border border-slate-200 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-xs gap-5 select-none overflow-hidden flex flex-col justify-between h-[180px]">
      {/* Background Ribbon Medal Watermark */}
      <Award 
        size={96} 
        className="absolute right-0 bottom-0 text-slate-100/50 -rotate-12 pointer-events-none -mr-4 -mb-4"
      />

      <div className="space-y-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-50 text-[#006e2f] flex items-center justify-center">
            <CheckCircle size={14} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Prove Your Expertise
          </h3>
        </div>
        <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[220px]">
          Take our free skill assessments to stand out to top employers.
        </p>
      </div>

      <div className="relative z-10">
        <Link
          href="/worker/tests"
          className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-[#006e2f] hover:bg-[#005321] active:bg-[#00421a] rounded-xl transition-all duration-150 shadow-xs cursor-pointer select-none"
        >
          Take a Test
        </Link>
      </div>
    </div>
  );
}
