"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, ArrowUpRight, Sparkles } from "lucide-react";
import { JobPerformance } from "@/types/employer/jobs";
import { isApplicantCapNear } from "@/lib/entitlements/limits";
import { ContextualUpgradeBanner } from "@/components/shared/entitlements/ContextualUpgradeBanner";
import { HiddenApplicantsBanner } from "@/components/shared/entitlements/HiddenApplicantsBanner";

interface PerformanceMetricsCardProps {
  jobId: string;
  performance: JobPerformance;
  planSlug?: string;
  applicantsPerJobLimit?: number | null;
  priorityScore?: number;
}

export function PerformanceMetricsCard({
  jobId,
  performance,
  planSlug = "discovery",
  applicantsPerJobLimit = null,
  priorityScore = 0,
}: PerformanceMetricsCardProps) {
  const isPriorityListing = priorityScore > 0;
  const visibleCount = performance.visibleApplications;
  const hiddenCount = performance.hiddenApplications;
  const nearCap = isApplicantCapNear(visibleCount, applicantsPerJobLimit);

  const capPercent =
    applicantsPerJobLimit !== null && applicantsPerJobLimit > 0
      ? Math.min(
          100,
          Math.round((visibleCount / applicantsPerJobLimit) * 100)
        )
      : 0;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[#006e2f]">
            <TrendingUp size={20} aria-hidden />
          </span>
          <h2 className="text-sm font-bold text-slate-800">Performance</h2>
        </div>
        {isPriorityListing ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-violet-700">
            <Sparkles className="h-3 w-3" aria-hidden />
            Boosted in search
          </span>
        ) : null}
      </div>

      {applicantsPerJobLimit !== null ? (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
            <span className="text-slate-500">Visible applicant cap</span>
            <span className="text-slate-700 tabular-nums">
              {visibleCount} / {applicantsPerJobLimit}
              {hiddenCount > 0 ? (
                <span className="text-amber-700 font-bold">
                  {" "}
                  · +{hiddenCount} hidden
                </span>
              ) : null}
            </span>
          </div>
          <div
            className="h-2 rounded-full bg-slate-100 overflow-hidden"
            role="progressbar"
            aria-valuenow={visibleCount}
            aria-valuemin={0}
            aria-valuemax={applicantsPerJobLimit}
            aria-label="Visible applicant cap usage"
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

      {hiddenCount > 0 ? (
        <HiddenApplicantsBanner
          hiddenCount={hiddenCount}
          visibleCount={visibleCount}
          capLimit={applicantsPerJobLimit}
          currentPlan={planSlug}
        />
      ) : null}

      {nearCap && hiddenCount === 0 ? (
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
                  · {visibleCount} visible
                  {hiddenCount > 0 ? ` · ${hiddenCount} hidden` : ""}
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
