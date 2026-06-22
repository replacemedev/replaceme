import React from "react";
import Link from "next/link";
import { FolderKanban, Check, Lock } from "lucide-react";

export function HiringKit() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-emerald-50/50 px-6 py-4 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-2 text-[#0a4a29]">
          <FolderKanban size={20} />
          <h3 className="font-bold text-sm">Exclusive Hiring Kit</h3>
        </div>
        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Lock size={10} /> PREMIUM
        </span>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        {/* Column 1 */}
        <div className="p-6 flex flex-col justify-between h-full">
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-4">One VA Away Method</h4>
            <ul className="space-y-2.5 mb-6">
              <li className="flex items-start gap-2.5 text-xs text-slate-600 leading-normal">
                <Check size={14} className="text-[#22c55e] shrink-0 mt-0.5" />
                <span>Spend less time hiring</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-600 leading-normal">
                <Check size={14} className="text-[#22c55e] shrink-0 mt-0.5" />
                <span>Make fewer mistakes</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-600 leading-normal">
                <Check size={14} className="text-[#22c55e] shrink-0 mt-0.5" />
                <span>Great hires every time</span>
              </li>
            </ul>
          </div>
          <Link
            href="/premium/hiring-kit/va"
            className="text-xs font-bold text-[#22c55e] hover:underline inline-flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-[#22c55e] rounded"
          >
            Unlock Access &rarr;
          </Link>
        </div>

        {/* Column 2 */}
        <div className="p-6 flex flex-col justify-between h-full">
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-4">Contracts & Documents</h4>
            <ul className="space-y-2.5 mb-6">
              <li className="flex items-start gap-2.5 text-xs text-slate-600 leading-normal">
                <Check size={14} className="text-[#22c55e] shrink-0 mt-0.5" />
                <span>Templates & Contracts</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-600 leading-normal">
                <Check size={14} className="text-[#22c55e] shrink-0 mt-0.5" />
                <span>Policies and Procedures</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-600 leading-normal">
                <Check size={14} className="text-[#22c55e] shrink-0 mt-0.5" />
                <span>Employment norms</span>
              </li>
            </ul>
          </div>
          <Link
            href="/premium/hiring-kit/contracts"
            className="text-xs font-bold text-[#22c55e] hover:underline inline-flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-[#22c55e] rounded"
          >
            Unlock Access &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
