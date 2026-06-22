import React from "react";
import Link from "next/link";
import { Award } from "lucide-react";

export function PremiumUpsell() {
  return (
    <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-full">
      {/* Decorative background element */}
      <div className="absolute -right-4 -bottom-4 opacity-5 text-emerald-800 pointer-events-none">
        <Award size={120} />
      </div>

      <div className="relative">
        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full">
          Upgrade
        </span>
        <h3 className="font-bold text-slate-900 text-base mt-3">Scale with Premium</h3>
        <p className="text-xs text-slate-500 leading-normal mt-2">
          Unlock direct talent access, priority job approval, and advanced candidate screening.
        </p>
      </div>

      <Link
        href="/premium/upgrade"
        className="w-full mt-6 bg-[#22c55e] text-white py-3 rounded-2xl text-xs font-bold hover:bg-[#16a34a] hover:-translate-y-0.5 transition-all text-center block shadow-sm focus-visible:outline-2 focus-visible:outline-[#22c55e]"
      >
        Upgrade Account
      </Link>
    </div>
  );
}
