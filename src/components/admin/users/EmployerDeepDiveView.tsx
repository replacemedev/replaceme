"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Briefcase, ExternalLink } from "lucide-react";
import { AdminSectionLabel } from "@/components/admin/shared/AdminFilterPills";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { PlanTierBadge } from "@/components/shared/billing/PlanTierBadge";
import { TablePagination } from "@/components/shared/TablePagination";
import type { AdminEmployerDeepDive } from "@/actions/admin/deep-dive";

interface EmployerDeepDiveViewProps {
  data: AdminEmployerDeepDive;
}

function formatUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString()}`;
}

export function EmployerDeepDiveView({ data }: EmployerDeepDiveViewProps) {
  const sub = data.subscription;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalItems = data.recentLedger.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const activePage = Math.min(currentPage, totalPages || 1);
  const paginatedLedger = data.recentLedger.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users?tab=employers"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to employers
      </Link>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {data.companyName}
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Employer account ID: {data.employerId}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={data.accountStatus} />
              {sub ? (
                <PlanTierBadge tier={sub.planName ?? "Free"} />
              ) : (
                <PlanTierBadge tier="Free" />
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Primary contact
              </p>
              <p className="font-medium text-slate-700 mt-1">{data.companyName}</p>
              <p className="text-xs text-slate-500 mt-0.5">{data.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Industry
              </p>
              <p className="font-medium text-slate-700 mt-1">
                {data.industry ?? "—"}
              </p>
            </div>
            {data.websiteUrl ? (
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Website
                </p>
                <a
                  href={
                    data.websiteUrl.startsWith("http")
                      ? data.websiteUrl
                      : `https://${data.websiteUrl}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:underline mt-1"
                >
                  {data.websiteUrl}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">
              Subscription billing details
            </h3>
            {sub ? (
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <StatusBadge status={sub.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Plan price</span>
                  <span className="font-mono font-medium">
                    {sub.unitAmountCents != null ? `$${(sub.unitAmountCents / 100).toFixed(0)}/mo` : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current period end</span>
                  <span className="font-medium">
                    {sub.currentPeriodEnd
                      ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
                {sub.stripeCustomerId ? (
                  <div className="flex justify-between border-t border-slate-50 pt-3">
                    <span className="text-slate-400">Stripe Customer</span>
                    <a
                      href={`https://dashboard.stripe.com/customers/${sub.stripeCustomerId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-[#006e2f] hover:underline"
                    >
                      {sub.stripeCustomerId}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-slate-500 mt-4">
                No active Stripe subscription record.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <AdminSectionLabel>Active job postings</AdminSectionLabel>
          <span className="rounded-full bg-[#ebfdf2] px-2.5 py-1 text-[11px] font-bold text-[#006e2f]">
            {data.jobs.length} posts
          </span>
        </div>
        {data.jobs.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No job posts yet.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.jobs.map((job) => (
              <li key={job.id}>
                <Link href={`/admin/jobs/${job.id}`} className="block">
                  <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-xs hover:border-slate-200 transition-colors">
                    <h4 className="font-bold text-slate-900 hover:text-emerald-700 truncate">
                      {job.title}
                    </h4>

                    <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-50">
                      <StatusBadge status={job.status} />
                      <span className="text-[10px] text-slate-400">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {data.recentLedger.length > 0 ? (
        <section className="space-y-4">
          <AdminSectionLabel>Recent billing events</AdminSectionLabel>
          <div className="space-y-4">
            <div className="overflow-x-auto w-full max-w-full rounded-lg shadow-sm border border-gray-200 bg-white">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedLedger.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(row.occurredAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-700">
                        {row.eventType.replace(/\./g, " ")}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {formatUsd(row.amountCents)} {row.currency.toUpperCase()}
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
      ) : null}
    </div>
  );
}
