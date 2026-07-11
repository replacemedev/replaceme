"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  TrendingUp,
  Briefcase,
  Calendar,
  Info,
  DollarSign,
  Clock,
} from "lucide-react";
import { WorkerEarningsSummary } from "@/lib/worker/earnings";
import { formatMoney } from "@/lib/format/currency";
import { WORKER_CARD, WORKER_CARD_HOVER } from "@/lib/worker/ui-tokens";
import { TablePagination } from "@/components/shared/TablePagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { EarningsFilterBar } from "./EarningsFilterBar";

interface Props {
  summary: WorkerEarningsSummary;
  profileCurrency: string;
}

export function EarningsDashboardClient({ summary, profileCurrency }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page") ?? "1");
  const activeSearch = searchParams.get("search") ?? "";
  const activeRange = searchParams.get("range") ?? "all_time";
  const isFiltered = !!activeSearch || activeRange !== "all_time";

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    if (page > 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatEmploymentType = (type: string) =>
    type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const renderContractBadge = (status: string) => {
    const map: Record<string, string> = {
      active: "bg-[#ebfdf2] text-[#006e2f] border-green-200/40",
      paused: "bg-amber-50 text-amber-700 border-amber-200/40",
      terminated: "bg-slate-100 text-slate-500 border-slate-200/40",
    };
    const classes = map[status] ?? map.terminated;
    const dot: Record<string, string> = {
      active: "bg-[#006e2f] animate-pulse",
      paused: "bg-amber-500",
      terminated: "bg-slate-400",
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${classes}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dot[status] ?? dot.terminated}`} />
        {formatEmploymentType(status)}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── 1. Informational Banner ─────────────────────────────────────── */}
      <div className="flex items-start gap-3 px-5 py-4 bg-blue-50 border border-blue-200/60 rounded-2xl">
        <Info
          size={18}
          className="shrink-0 mt-0.5 text-blue-500"
          aria-hidden
        />
        <p className="text-sm font-medium text-blue-800 leading-relaxed">
          <span className="font-bold">Note:</span> ReplaceMe does not process
          direct payments. All compensation is settled directly between you and
          your employer off-platform. This dashboard is for tracking your
          contracted work.
        </p>
      </div>

      {/* ── 2. Metrics Overview ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card: Total Recorded Earnings */}
        <div
          className={`${WORKER_CARD} ${WORKER_CARD_HOVER} p-6 relative overflow-hidden group border-t-4 border-t-[#006e2f]`}
        >
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-[0.04] group-hover:scale-110 transition-transform duration-500 text-[#006e2f]">
            <TrendingUp size={130} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recorded Earnings
            </span>
            <div className="p-2 bg-[#ebfdf2] text-[#006e2f] rounded-xl">
              <TrendingUp size={17} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {formatMoney(summary.metrics.totalRecordedIncome, profileCurrency)}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {profileCurrency}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-2">
            All-time income tracked on this platform
          </p>
        </div>

        {/* Card: Active Contracts */}
        <div
          className={`${WORKER_CARD} ${WORKER_CARD_HOVER} p-6 relative overflow-hidden group border-t-4 border-t-emerald-500`}
        >
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-[0.04] group-hover:scale-110 transition-transform duration-500 text-emerald-500">
            <Briefcase size={130} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Contracts
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Briefcase size={17} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {summary.metrics.activeContractsCount}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {summary.metrics.activeContractsCount === 1 ? "contract" : "contracts"}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-2">
            Jobs you are currently working on
          </p>
        </div>

        {/* Card: Projected Monthly Income */}
        <div
          className={`${WORKER_CARD} ${WORKER_CARD_HOVER} p-6 relative overflow-hidden group border-t-4 border-t-slate-400`}
        >
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-[0.04] group-hover:scale-110 transition-transform duration-500 text-slate-400">
            <Clock size={130} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Projected Monthly Income
            </span>
            <div className="p-2 bg-slate-100 text-slate-500 rounded-xl">
              <Clock size={17} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {formatMoney(summary.metrics.projectedMonthlyIncome, profileCurrency)}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {profileCurrency}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-2">
            Estimated from your active contract rates
          </p>
        </div>
      </div>

      {/* ── 3. Search & Filter Bar ──────────────────────────────────────── */}
      <EarningsFilterBar />

      {/* ── 4. Hire Records Table / Empty State ─────────────────────────── */}
      {summary.records.length === 0 ? (
        <EmptyState
          icon={<DollarSign size={22} aria-hidden />}
          title={isFiltered ? "No records match your filters" : "No income recorded yet"}
          description={
            isFiltered
              ? "Try adjusting your search term or date range."
              : "Jobs you have been hired for will appear here once a contract is created."
          }
          actionLabel={isFiltered ? undefined : "Browse jobs"}
          actionHref={isFiltered ? undefined : "/worker/jobs"}
          action={
            isFiltered ? (
              <button
                onClick={() => router.push(pathname)}
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-[#006e2f] hover:bg-[#005c26] rounded-lg transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {/* Desktop & Tablet Table (≥ md) */}
          <div className="hidden md:block overflow-hidden bg-white border border-slate-100 rounded-3xl shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                      Date Hired
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Job Title
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Employer
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Agreed Rate
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.records.map((rec) => (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50/40 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-600 tabular-nums whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar size={13} className="text-slate-400 shrink-0" />
                          {formatDate(rec.dateHired)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-900">
                          {rec.jobTitle}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-700">
                          {rec.employerName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                            {formatMoney(rec.hourlyRate, profileCurrency)}/hr
                          </span>
                          <span className="text-xs text-slate-400 font-medium mt-0.5">
                            {rec.weeklyHours} hrs/wk · {formatEmploymentType(rec.employmentType)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {renderContractBadge(rec.contractStatus)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Stacked Cards (< md) */}
          <div className="block md:hidden bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden divide-y divide-slate-100">
            {summary.records.map((rec) => (
              <div
                key={rec.id}
                className="p-5 flex flex-col gap-3 hover:bg-slate-50/30 transition-colors"
              >
                {/* Row 1: Job title + status badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-slate-900 leading-snug">
                      {rec.jobTitle}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 mt-0.5">
                      {rec.employerName}
                    </span>
                  </div>
                  <div className="shrink-0">{renderContractBadge(rec.contractStatus)}</div>
                </div>

                {/* Row 2: Date hired + Rate */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Date Hired
                    </span>
                    <span className="text-xs font-semibold text-slate-600 mt-0.5">
                      {formatDate(rec.dateHired)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Agreed Rate
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 mt-0.5 tabular-nums">
                      {formatMoney(rec.hourlyRate, profileCurrency)}/hr
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {rec.weeklyHours} hrs/wk
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <TablePagination
            totalItems={summary.totalCount}
            pageSize={8}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            label="contracts"
            className="border border-slate-100 bg-white px-5 py-4 rounded-3xl shadow-xs"
          />
        </div>
      )}
    </div>
  );
}
