"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { TrendingUp, Clock, Wallet, DollarSign, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { WorkerFinancials } from "@/lib/worker/earnings";
import { formatMoney } from "@/lib/format/currency";
import { WORKER_CARD, WORKER_CARD_HOVER } from "@/lib/worker/ui-tokens";
import { TablePagination } from "@/components/shared/TablePagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { EarningsFilterBar } from "./EarningsFilterBar";
import { DownloadReceiptButton } from "./DownloadReceiptButton";

interface EarningsDashboardClientProps {
  initialFinancials: WorkerFinancials;
  profileCurrency: string;
}

export function EarningsDashboardClient({
  initialFinancials,
  profileCurrency,
}: EarningsDashboardClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page") ?? "1");
  const activeSearch = searchParams.get("search") ?? "";
  const activeRange = searchParams.get("range") ?? "all_time";
  const activeStatus = searchParams.get("status") ?? "all";

  // Handles page change by pushing state to the URL search params
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    if (page > 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Triggers mock withdrawal toast notification
  const handleWithdrawal = () => {
    const withdrawAmount = formatMoney(initialFinancials.metrics.availableWithdrawal, profileCurrency);
    const toastId = toast.loading(`Initiating withdrawal of ${withdrawAmount}...`);
    
    setTimeout(() => {
      toast.success("Withdrawal successful!", {
        id: toastId,
        description: `Transferred ${withdrawAmount} to your linked bank account.`,
      });
    }, 1500);
  };

  // Helper to format table dates nicely
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Renders beautiful, premium colored badges for the statuses
  const renderStatusBadge = (status: "paid" | "pending" | "processing") => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ebfdf2] text-[#006e2f] border border-green-200/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#006e2f] animate-pulse" />
            Paid
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/40">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Processing
          </span>
        );
    }
  };

  const hasActiveFilters = activeSearch || activeRange !== "all_time" || activeStatus !== "all";

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Premium Metrics Overview (Top Section) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric Card: Total Earnings */}
        <div className={`${WORKER_CARD} ${WORKER_CARD_HOVER} p-6 relative overflow-hidden group border-t-4 border-t-[#006e2f]`}>
          <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 opacity-5 group-hover:scale-110 transition-transform duration-500 text-[#006e2f]">
            <TrendingUp size={140} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Earnings (Lifetime)
            </span>
            <div className="p-2 bg-green-50 text-[#006e2f] rounded-2xl">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none tabular-nums">
              {formatMoney(initialFinancials.metrics.totalEarnings, profileCurrency)}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {profileCurrency}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-2">
            All cleared and completed payouts
          </p>
        </div>

        {/* Metric Card: Pending / In Escrow */}
        <div className={`${WORKER_CARD} ${WORKER_CARD_HOVER} p-6 relative overflow-hidden group border-t-4 border-t-amber-500`}>
          <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 opacity-5 group-hover:scale-110 transition-transform duration-500 text-amber-500">
            <Clock size={140} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending / In Escrow
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-2xl">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none tabular-nums">
              {formatMoney(initialFinancials.metrics.pendingEscrow, profileCurrency)}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {profileCurrency}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-2">
            Expected soon from processing contracts
          </p>
        </div>

        {/* Metric Card: Available for Withdrawal */}
        <div className={`${WORKER_CARD} ${WORKER_CARD_HOVER} p-6 relative overflow-hidden group border-t-4 border-t-emerald-600 bg-gradient-to-br from-white to-slate-50/20`}>
          <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 opacity-5 group-hover:scale-110 transition-transform duration-500 text-emerald-600">
            <Wallet size={140} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Available for Withdrawal
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Wallet size={18} />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none tabular-nums">
                {formatMoney(initialFinancials.metrics.availableWithdrawal, profileCurrency)}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {profileCurrency}
              </span>
            </div>
            
            <button
              onClick={handleWithdrawal}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#006e2f] hover:bg-[#005c26] rounded-xl transition-all shadow-xs duration-200 hover:shadow-sm cursor-pointer"
            >
              <span>Withdraw</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-2">
            Ready to transfer instantly to bank
          </p>
        </div>
      </div>

      {/* 2. URL-Driven Search & Filter Bar */}
      <EarningsFilterBar />

      {/* 3. Detailed Earnings Data Table / Cards */}
      {initialFinancials.transactions.length === 0 ? (
        <EmptyState
          icon={<DollarSign size={22} />}
          title={hasActiveFilters ? "No transactions match filters" : "No earnings recorded"}
          description={
            hasActiveFilters
              ? "Try adjusting your search keywords, status, or date range options."
              : "Completed payouts and work transaction history will show up here."
          }
          actionLabel={hasActiveFilters ? "Clear filters" : "Find jobs"}
          actionHref={hasActiveFilters ? undefined : "/worker/jobs"}
          action={
            hasActiveFilters ? (
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
        <div className="flex flex-col w-full">
          {/* Table wrapper for Premium presentation */}
          <div className="w-full overflow-hidden bg-white border border-slate-100 rounded-3xl shadow-xs">
            {/* Desktop & Tablet Table (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Date
                    </th>
                    <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Job / Client Name
                    </th>
                    <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Amount
                    </th>
                    <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {initialFinancials.transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/40 transition-colors"
                    >
                      <td className="px-6 py-4.5 text-sm font-medium text-slate-600 tabular-nums">
                        {formatDate(tx.date)}
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 leading-snug">
                            {tx.job_title}
                          </span>
                          <span className="text-xs font-semibold text-slate-400 mt-0.5">
                            {tx.client_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 text-sm font-extrabold text-slate-900 tabular-nums">
                        {formatMoney(tx.amount, profileCurrency)}
                      </td>
                      <td className="px-6 py-4.5">
                        {renderStatusBadge(tx.status)}
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <DownloadReceiptButton
                          referenceNumber={tx.reference_number}
                          jobTitle={tx.job_title}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card List (< md) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {initialFinancials.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-5 flex flex-col gap-3 hover:bg-slate-50/30 transition-all duration-150"
                >
                  {/* Row 1: Job Title & Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-slate-900 leading-snug truncate">
                        {tx.job_title}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 mt-0.5">
                        {tx.client_name}
                      </span>
                    </div>
                    <div className="shrink-0">
                      {renderStatusBadge(tx.status)}
                    </div>
                  </div>

                  {/* Row 2: Date & Amount Details */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                        Date
                      </span>
                      <span className="text-xs font-semibold text-slate-600 mt-0.5 tabular-nums">
                        {formatDate(tx.date)}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                        Amount
                      </span>
                      <span className="text-sm font-extrabold text-slate-900 mt-0.5 tabular-nums">
                        {formatMoney(tx.amount, profileCurrency)}
                      </span>
                    </div>
                  </div>

                  {/* Row 3: Action Button */}
                  <div className="flex justify-end mt-1 pt-1.5">
                    <div className="w-full sm:w-auto">
                      <DownloadReceiptButton
                        referenceNumber={tx.reference_number}
                        jobTitle={tx.job_title}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Table Pagination Controls */}
          <TablePagination
            totalItems={initialFinancials.totalCount}
            pageSize={5}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            label="transactions"
            className="border border-slate-100 bg-white px-5 py-4.5 rounded-3xl shadow-xs mt-4"
          />
        </div>
      )}
    </div>
  );
}
