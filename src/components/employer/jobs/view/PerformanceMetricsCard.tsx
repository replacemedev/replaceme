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

  const capPercent =
    applicantsPerJobLimit !== null && applicantsPerJobLimit > 0
      ? Math.min(
          100,
          Math.round(
            (performance.totalApplications / applicantsPerJobLimit) * 100
          )
        )
      : 0;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-[#006e2f]">
          <TrendingUp size={20} aria-hidden />
        </span>
        <h2 className="text-sm font-bold text-slate-800">Performance</h2>
      </div>

      {applicantsPerJobLimit !== null ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500">Applicant cap</span>
            <span className="text-slate-700 tabular-nums">
              {performance.totalApplications} / {applicantsPerJobLimit}
            </span>
          </div>
          <div
            className="h-2 rounded-full bg-slate-100 overflow-hidden"
            role="progressbar"
            aria-valuenow={performance.totalApplications}
            aria-valuemin={0}
            aria-valuemax={applicantsPerJobLimit}
            aria-label="Applicant cap usage"
          >
            <div
              className={`h-full rounded-full transition-all ${
                capPercent >= 90 ? "bg-amber-500" : "bg-[#006e2f]"
              }`}
              style={{ width: `${capPercent}%` }}
            />
          </div>
        </div>
      ) : null}

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
          <span className="flex items-center gap-0.5 px-2 py-0.5 bg-[#ebfdf2] text-[#006e2f] text-[10px] font-bold rounded-lg border border-[#006e2f]/10">
            <ArrowUpRight size={10} aria-hidden />
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
          <span className="flex items-center gap-0.5 px-2 py-0.5 bg-[#ebfdf2] text-[#006e2f] text-[10px] font-bold rounded-lg border border-[#006e2f]/10">
            <ArrowUpRight size={10} aria-hidden />
            {performance.applicationsTrend}
          </span>
        </div>

        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Shortlisted</p>
            <p className="text-xl font-extrabold text-[#006e2f] mt-1">
              {performance.shortlistedCount}
            </p>
          </div>
          <Link
            href={`/employer/jobs/${jobId}/applicants`}
            className="text-xs font-bold text-[#006e2f] hover:text-[#005c26] transition-colors"
          >
            View Candidates
          </Link>
        </div>
      </div>
    </div>
  );
}
