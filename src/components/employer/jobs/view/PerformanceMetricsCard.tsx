"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import { JobPerformance } from "@/types/employer/jobs";
import { isApplicantCapNear } from "@/lib/entitlements/limits";
import { ContextualUpgradeBanner } from "@/components/shared/entitlements/ContextualUpgradeBanner";

interface PerformanceMetricsCardProps {
  jobId: string;
  performance: JobPerformance;
  planSlug?: string;
  applicantsPerJobLimit?: number | null;
}

export function PerformanceMetricsCard({
  jobId,
  performance,
  planSlug = "discovery",
  applicantsPerJobLimit = null,
}: PerformanceMetricsCardProps) {
  const nearCap = isApplicantCapNear(
    performance.totalApplications,
    applicantsPerJobLimit
  );

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-emerald-600">
          <TrendingUp size={20} />
        </span>
        <h2 className="text-sm font-bold text-slate-800">Performance</h2>
      </div>

      {nearCap ? (
        <ContextualUpgradeBanner
          feature="applicant_cap"
          currentPlan={planSlug}
        />
      ) : null}

      <div className="space-y-4">
        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Views</p>
            <p className="text-xl font-extrabold text-slate-800 mt-1">
              {performance.totalViews.toLocaleString()}
            </p>
          </div>
          <span className="flex items-center gap-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100">
            <ArrowUpRight size={10} />
            {performance.viewsTrend}
          </span>
        </div>

        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">
              Total Applications
              {applicantsPerJobLimit !== null ? (
                <span className="text-slate-500">
                  {" "}
                  · cap {applicantsPerJobLimit}
                </span>
              ) : null}
            </p>
            <p className="text-xl font-extrabold text-slate-800 mt-1">
              {performance.totalApplications}
            </p>
          </div>
          <span className="flex items-center gap-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100">
            <ArrowUpRight size={10} />
            {performance.applicationsTrend}
          </span>
        </div>

        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Shortlisted</p>
            <p className="text-xl font-extrabold text-[#22c55e] mt-1">
              {performance.shortlistedCount}
            </p>
          </div>
          <Link
            href={`/employer/jobs/${jobId}/applicants`}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            View Candidates
          </Link>
        </div>
      </div>
    </div>
  );
}
