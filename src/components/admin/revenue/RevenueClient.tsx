"use client";

import { useState } from "react";
import { DollarSign, CreditCard, TrendingUp } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatCard } from "@/components/shared/StatCard";
import { AdminSectionLabel } from "@/components/admin/shared/AdminFilterPills";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { PlanTierBadge } from "@/components/shared/billing/PlanTierBadge";
import { TablePagination } from "@/components/shared/TablePagination";
import type { AdminSubscriptionRow } from "@/types/admin.types";

interface RevenueClientProps {
  subscriptions: AdminSubscriptionRow[];
}

export function RevenueClient({ subscriptions }: RevenueClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  if (subscriptions.length === 0) {
    return (
      <EmptyState
        icon={<DollarSign className="h-5 w-5" aria-hidden />}
        title="No subscriptions yet"
        description="Employer billing records from Stripe will appear here."
      />
    );
  }

  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const mrr = subscriptions
    .filter((s) => s.status === "active" && s.plan_price)
    .reduce((sum, s) => sum + (s.plan_price ?? 0), 0);

  const totalItems = subscriptions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const activePage = Math.min(currentPage, totalPages || 1);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedSubs = subscriptions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <AdminSectionLabel>Billing overview</AdminSectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <StatCard
            variant="dashboard"
            title="Active Subscriptions"
            value={activeCount}
            icon={<CreditCard className="h-4 w-4" aria-hidden />}
            iconBgClass="bg-[#ebfdf2]"
            iconColorClass="text-[#006e2f]"
          />
          <StatCard
            variant="dashboard"
            title="Estimated MRR"
            value={`$${mrr.toLocaleString()}`}
            icon={<TrendingUp className="h-4 w-4" aria-hidden />}
            iconBgClass="bg-violet-50"
            iconColorClass="text-violet-600"
          />
          <StatCard
            variant="dashboard"
            title="Total Accounts"
            value={subscriptions.length}
            icon={<DollarSign className="h-4 w-4" aria-hidden />}
            iconBgClass="bg-blue-50"
            iconColorClass="text-blue-600"
          />
        </div>
      </section>

      <section className="space-y-4">
        <AdminSectionLabel>Subscription ledger</AdminSectionLabel>
        <div className="space-y-4">
          <div className="overflow-x-auto w-full max-w-full rounded-lg shadow-sm border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Employer</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Usage</th>
                  <th className="px-4 py-3">Period end</th>
                  <th className="px-4 py-3">Stripe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {sub.company_name ?? "—"}
                      </p>
                      <p className="text-xs text-slate-400">{sub.employer_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <p className="text-slate-700 font-medium">{sub.plan_name ?? "—"}</p>
                        {sub.plan_name ? (
                          <PlanTierBadge tier={sub.plan_name} />
                        ) : null}
                      </div>
                      {sub.plan_price != null ? (
                        <p className="text-xs text-slate-400 font-mono mt-1">
                          ${sub.plan_price}/mo
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {sub.job_posts_used} active jobs
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {sub.current_period_end
                        ? new Date(sub.current_period_end).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {sub.stripe_customer_id ? (
                        <a
                          href={`https://dashboard.stripe.com/customers/${sub.stripe_customer_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-[#006e2f] hover:underline"
                        >
                          View in Stripe
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">No Stripe ID</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TablePagination
            currentPage={activePage}
            totalItems={totalItems}
            pageSize={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </section>
    </div>
  );
}
