"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  CalendarClock,
  CreditCard,
  DollarSign,
  TrendingUp,
  Search,
} from "lucide-react";
import { Suspense } from "react";
import { AdminTabs } from "@/components/admin/shared/AdminTabs";
import { AdminTabsSkeleton } from "@/components/admin/shared/AdminSkeletons";
import { AdminSectionLabel } from "@/components/admin/shared/AdminFilterPills";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { BillingOpsClient } from "@/components/admin/billing/BillingOpsClient";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatCard } from "@/components/shared/StatCard";
import { PlanTierBadge } from "@/components/shared/billing/PlanTierBadge";
import { TablePagination } from "@/components/shared/TablePagination";
import type { AdminBillingPageData } from "@/types/admin.types";
import { formatCurrency } from "@/lib/format/currency";

interface AdminBillingDashboardProps {
  data: AdminBillingPageData;
  activeTab: string;
}

function formatCents(cents: number): string {
  return formatCurrency(cents / 100, "USD", { maximumFractionDigits: 0 });
}

function formatEventType(type: string): string {
  return type.replace(/\./g, " ").replace(/_/g, " ");
}

export function AdminBillingDashboard({ data, activeTab }: AdminBillingDashboardProps) {
  const { metrics, subscriptions, ledger } = data;
  const tab = activeTab === "ledger" || activeTab === "ops" ? activeTab : "overview";

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeSearch = searchParams.get("search") ?? "";
  const activePlan = searchParams.get("plan") ?? "all";
  const activeStatus = searchParams.get("status") ?? "all";

  const [searchTerm, setSearchTerm] = useState(activeSearch);

  // Sync local search term if URL changes externally
  useEffect(() => {
    setSearchTerm(activeSearch);
  }, [activeSearch]);

  // Debounced search logic to sync input search query to URL query parameters
  useEffect(() => {
    const handler = setTimeout(() => {
      const currentSearch = new URLSearchParams(window.location.search).get("search") ?? "";
      if (currentSearch === searchTerm) return;

      const params = new URLSearchParams(window.location.search);
      if (searchTerm) {
        params.set("search", searchTerm);
      } else {
        params.delete("search");
      }
      params.delete("page"); // Reset page when search query changes
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, pathname, router]);

  // Handlers for Select option changes
  const handlePlanChange = (val: string) => {
    const params = new URLSearchParams(window.location.search);
    if (val && val !== "all") {
      params.set("plan", val);
    } else {
      params.delete("plan");
    }
    params.delete("page"); // Reset page on filter change
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleStatusChange = (val: string) => {
    const params = new URLSearchParams(window.location.search);
    if (val && val !== "all") {
      params.set("status", val);
    } else {
      params.delete("status");
    }
    params.delete("page"); // Reset page on filter change
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const [subPage, setSubPage] = useState(1);
  const [ledgerPage, setLedgerPage] = useState(1);
  const itemsPerPage = 20;

  // Reset subscription page when filter parameters change
  useEffect(() => {
    setSubPage(1);
  }, [activeSearch, activePlan, activeStatus]);

  // Filter subscriptions array case-insensitively
  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (activeSearch) {
      const searchLower = activeSearch.toLowerCase();
      const companyMatch = sub.company_name?.toLowerCase().includes(searchLower) ?? false;
      const emailMatch = sub.employer_email?.toLowerCase().includes(searchLower) ?? false;
      if (!companyMatch && !emailMatch) {
        return false;
      }
    }

    if (activePlan !== "all") {
      if (sub.plan_slug?.toLowerCase() !== activePlan.toLowerCase()) {
        return false;
      }
    }

    if (activeStatus !== "all") {
      if (sub.status?.toLowerCase() !== activeStatus.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  // Subscription pagination
  const totalSubItems = filteredSubscriptions.length;
  const totalSubPages = Math.ceil(totalSubItems / itemsPerPage);
  const activeSubPage = Math.min(subPage, totalSubPages || 1);
  const paginatedSubscriptions = filteredSubscriptions.slice(
    (activeSubPage - 1) * itemsPerPage,
    activeSubPage * itemsPerPage
  );

  // Ledger pagination
  const totalLedgerItems = ledger.length;
  const totalLedgerPages = Math.ceil(totalLedgerItems / itemsPerPage);
  const activeLedgerPage = Math.min(ledgerPage, totalLedgerPages || 1);
  const paginatedLedger = ledger.slice(
    (activeLedgerPage - 1) * itemsPerPage,
    activeLedgerPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <Suspense fallback={<AdminTabsSkeleton count={3} />}>
        <AdminTabs
          tabs={[
            { id: "overview", label: "Overview" },
            { id: "ledger", label: "Transactions", count: ledger.length },
            { id: "ops", label: "Ops" },
          ]}
        />
      </Suspense>

      {tab === "overview" ? (
        <div className="space-y-6">
          <section className="space-y-4">
            <AdminSectionLabel>Billing overview</AdminSectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
              <StatCard
                variant="dashboard"
                title="Active Subscriptions"
                value={metrics.active_subscriptions}
                icon={<CreditCard className="h-4 w-4" aria-hidden />}
                iconBgClass="bg-[#ebfdf2]"
                iconColorClass="text-[#006e2f]"
              />
              <StatCard
                variant="dashboard"
                title="Estimated MRR"
                value={formatCents(metrics.estimated_mrr_cents)}
                icon={<TrendingUp className="h-4 w-4" aria-hidden />}
                iconBgClass="bg-violet-50"
                iconColorClass="text-violet-600"
              />
              <StatCard
                variant="dashboard"
                title="Total Accounts"
                value={metrics.total_accounts}
                icon={<DollarSign className="h-4 w-4" aria-hidden />}
                iconBgClass="bg-blue-50"
                iconColorClass="text-blue-600"
              />
              <StatCard
                variant="dashboard"
                title="Failed Payments (30d)"
                value={metrics.failed_payments_30d}
                icon={<AlertTriangle className="h-4 w-4" aria-hidden />}
                iconBgClass="bg-amber-50"
                iconColorClass="text-amber-600"
              />
              <StatCard
                variant="dashboard"
                title="Scheduled changes"
                value={metrics.scheduled_changes ?? 0}
                icon={<CalendarClock className="h-4 w-4" aria-hidden />}
                iconBgClass="bg-sky-50"
                iconColorClass="text-sky-700"
              />
            </div>
          </section>

          {metrics.tier_breakdown.length > 0 ? (
            <section className="space-y-4">
              <AdminSectionLabel>Revenue by tier</AdminSectionLabel>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {metrics.tier_breakdown.map((tier) => (
                  <div
                    key={tier.plan_slug}
                    className="rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <PlanTierBadge tier={tier.plan_slug} size="sm" />
                      <span className="text-xs font-semibold text-slate-500">
                        {tier.count} acct{tier.count === 1 ? "" : "s"}
                      </span>
                    </div>
                    <p className="mt-3 text-2xl font-bold text-slate-900">
                      {formatCents(tier.mrr_cents)}
                    </p>
                    <p className="text-xs text-slate-400">est. monthly</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-4">
            <AdminSectionLabel>Subscription ledger</AdminSectionLabel>

            {/* Search and Filters Bar */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search employer or email..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 rounded-lg text-sm transition-colors text-slate-800 placeholder-slate-400 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 md:flex md:items-center md:gap-3">
                <div className="flex flex-col min-w-[140px]">
                  <select
                    value={activePlan}
                    onChange={(e) => handlePlanChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 rounded-lg text-sm transition-colors text-slate-700 bg-white cursor-pointer"
                  >
                    <option value="all">All Plans</option>
                    <option value="discovery">Discovery</option>
                    <option value="starter">Starter</option>
                    <option value="growth">Growth</option>
                    <option value="scale">Scale</option>
                  </select>
                </div>

                <div className="flex flex-col min-w-[140px]">
                  <select
                    value={activeStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 rounded-lg text-sm transition-colors text-slate-700 bg-white cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </div>
              </div>
            </div>

            {subscriptions.length === 0 ? (
              <EmptyState
                icon={<DollarSign className="h-5 w-5" aria-hidden />}
                title="No subscriptions yet"
                description="Employer billing records from Stripe will appear here."
              />
            ) : filteredSubscriptions.length === 0 ? (
              <EmptyState
                icon={<Search className="h-5 w-5 text-slate-400" aria-hidden />}
                title="No subscriptions match your filters"
                description="Try clearing your search query or choosing different status/plan filters."
              />
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto w-full max-w-full rounded-lg shadow-sm border border-gray-200 bg-white">
                  <table className="w-full min-w-[860px] text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-3">Employer</th>
                        <th className="px-4 py-3">Plan</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="hidden md:table-cell px-4 py-3">Scheduled</th>
                        <th className="hidden md:table-cell px-4 py-3">Payment</th>
                        <th className="hidden lg:table-cell px-4 py-3">Period end</th>
                        <th className="px-4 py-3">Stripe</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {paginatedSubscriptions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <Link
                              href={`/admin/users/employers/${sub.employer_id}`}
                              className="font-medium text-slate-900 hover:text-emerald-700 hover:underline"
                            >
                              {sub.company_name ?? "—"}
                            </Link>
                            <p className="text-xs text-slate-400">{sub.employer_email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-slate-700">
                                {sub.plan_name ?? "—"}
                              </span>
                              {sub.plan_slug ? (
                                <PlanTierBadge tier={sub.plan_slug} size="sm" />
                              ) : null}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={sub.status} />
                          </td>
                          <td className="hidden md:table-cell px-4 py-3">
                            {sub.scheduled_plan_slug || sub.cancel_at_period_end ? (
                              <div className="space-y-0.5">
                                <p className="text-xs font-semibold text-amber-800">
                                  →{" "}
                                  {sub.cancel_at_period_end &&
                                  !sub.scheduled_plan_slug
                                    ? "Discovery"
                                    : sub.scheduled_plan_slug}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {sub.scheduled_effective_at
                                    ? new Date(
                                        sub.scheduled_effective_at
                                      ).toLocaleDateString()
                                    : sub.current_period_end
                                      ? new Date(
                                          sub.current_period_end
                                        ).toLocaleDateString()
                                      : "period end"}
                                </p>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                          <td className="hidden md:table-cell px-4 py-3">
                            {sub.last_payment_status ? (
                              <div className="space-y-0.5">
                                <StatusBadge status={sub.last_payment_status} />
                                {sub.failed_payment_count > 0 ? (
                                  <p className="text-[10px] text-amber-700">
                                    {sub.failed_payment_count} failed
                                  </p>
                                ) : null}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                          <td className="hidden lg:table-cell px-4 py-3 text-xs text-slate-500">
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
                                Stripe
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  currentPage={activeSubPage}
                  totalItems={totalSubItems}
                  pageSize={itemsPerPage}
                  onPageChange={setSubPage}
                />
              </div>
            )}
          </section>
        </div>
      ) : null}

      {tab === "ledger" ? (
        <section className="space-y-4">
          <AdminSectionLabel>Recent transactions</AdminSectionLabel>
          {ledger.length === 0 ? (
            <EmptyState
              icon={<CreditCard className="h-5 w-5" aria-hidden />}
              title="No ledger events yet"
              description="Invoice payments and failures from Stripe webhooks will appear here."
            />
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto w-full max-w-full rounded-lg shadow-sm border border-gray-200 bg-white">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3">When</th>
                      <th className="px-4 py-3">Employer</th>
                      <th className="px-4 py-3">Event</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="hidden sm:table-cell px-4 py-3">Plan</th>
                      <th className="px-4 py-3">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginatedLedger.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(row.occurred_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/users/employers/${row.employer_id}`}
                            className="font-medium text-slate-900 hover:text-emerald-700 hover:underline"
                          >
                            {row.company_name ?? "—"}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className="capitalize text-slate-700">
                            {formatEventType(row.event_type)}
                          </span>
                          {row.subscription_status ? (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {row.subscription_status}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-700">
                          {formatCents(row.amount_cents)}
                        </td>
                        <td className="hidden sm:table-cell px-4 py-3">
                          {row.plan_slug ? (
                            <PlanTierBadge tier={row.plan_slug} size="sm" />
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {row.stripe_invoice_id ? (
                            <a
                              href={`https://dashboard.stripe.com/invoices/${row.stripe_invoice_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-[#006e2f] hover:underline"
                            >
                              View
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TablePagination
                currentPage={activeLedgerPage}
                totalItems={totalLedgerItems}
                pageSize={itemsPerPage}
                onPageChange={setLedgerPage}
              />
            </div>
          )}
        </section>
      ) : null}

      {tab === "ops" ? <BillingOpsClient subscriptions={subscriptions} /> : null}
    </div>
  );
}
