import React from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { BillingPlan as BillingPlanType } from "@/types/employer/dashboard";

interface BillingPlanProps {
  billing: BillingPlanType | null;
}

export function BillingPlan({ billing }: BillingPlanProps) {
  if (!billing) {
    return (
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-bold text-slate-800">Plan & Billing</h2>
          <Link 
            href="/billing" 
            className="text-slate-400 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-[#22c55e] rounded"
          >
            <Settings size={18} />
          </Link>
        </div>
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 text-center">
          <p className="text-sm font-semibold text-slate-700">No active billing plan</p>
          <Link
            href="/billing/plans"
            className="w-full mt-4 bg-[#22c55e] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-[#16a34a] transition-colors block text-center focus-visible:outline-2 focus-visible:outline-[#22c55e]"
          >
            Choose a Plan
          </Link>
        </div>
      </section>
    );
  }

  const unlocksPercent = (billing.usage.candidateUnlocks.used / billing.usage.candidateUnlocks.total) * 100;
  const jobsPercent = (billing.usage.jobPosts.used / billing.usage.jobPosts.total) * 100;

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-bold text-slate-800">Plan & Billing</h2>
        <Link 
          href="/billing" 
          className="text-slate-400 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-[#22c55e] rounded"
        >
          <Settings size={18} />
        </Link>
      </div>
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-bold text-lg leading-tight">{billing.name}</h3>
            <p className="text-slate-300 text-sm mt-0.5">{billing.price}</p>
          </div>
          <span className="bg-white/10 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
            {billing.status}
          </span>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1.5 text-slate-300">
              <span>Candidate Unlocks</span>
              <span>{billing.usage.candidateUnlocks.used} / {billing.usage.candidateUnlocks.total}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div className="bg-[#22c55e] h-1.5 rounded-full" style={{ width: `${unlocksPercent}%` }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs mb-1.5 text-slate-300">
              <span>Active Job Posts</span>
              <span>{billing.usage.jobPosts.used} / {billing.usage.jobPosts.total}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div className="bg-[#22c55e] h-1.5 rounded-full" style={{ width: `${jobsPercent}%` }}></div>
            </div>
          </div>
        </div>
        
        <Link 
          href="/billing"
          className="w-full mt-6 bg-white text-slate-900 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors block text-center focus-visible:outline-2 focus-visible:outline-[#22c55e]"
        >
          Manage Billing
        </Link>
      </div>
    </section>
  );
}
