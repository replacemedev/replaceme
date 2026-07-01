import Link from "next/link";
import { ArrowLeft, Briefcase, ExternalLink } from "lucide-react";
import { AdminSectionLabel } from "@/components/admin/shared/AdminFilterPills";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { PlanTierBadge } from "@/components/shared/billing/PlanTierBadge";
import type { AdminEmployerDeepDive } from "@/actions/admin/deep-dive";

interface EmployerDeepDiveViewProps {
  data: AdminEmployerDeepDive;
}

function formatUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString()}`;
}

export function EmployerDeepDiveView({ data }: EmployerDeepDiveViewProps) {
  const sub = data.subscription;

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
          <h2 className="text-xl font-bold text-slate-900">{data.companyName}</h2>
          <p className="mt-1 text-sm text-slate-500">{data.email}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge status={data.accountStatus} />
            {data.industry ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                {data.industry}
              </span>
            ) : null}
          </div>
          {data.companyBio ? (
            <p className="mt-4 text-sm leading-relaxed text-slate-700">{data.companyBio}</p>
          ) : null}
          {data.websiteUrl ? (
            <a
              href={data.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline"
            >
              Website
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          ) : null}
          <p className="mt-4 text-xs text-slate-400">
            Joined {new Date(data.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <AdminSectionLabel>Stripe subscription</AdminSectionLabel>
          {sub ? (
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={sub.status} />
                {sub.planSlug ? <PlanTierBadge tier={sub.planSlug} /> : null}
              </div>
              <p className="text-sm font-medium text-slate-800">{sub.planName ?? "—"}</p>
              {sub.unitAmountCents ? (
                <p className="text-xs font-mono text-slate-500">
                  {formatUsd(sub.unitAmountCents)}
                  {sub.billingInterval ? ` / ${sub.billingInterval}` : ""}
                </p>
              ) : null}
              <p className="text-xs text-slate-500">
                Usage: {sub.jobPostsUsed} jobs · {sub.unlocksUsed} unlocks
              </p>
              {sub.lastPaymentStatus ? (
                <div>
                  <StatusBadge status={sub.lastPaymentStatus} />
                  {sub.failedPaymentCount > 0 ? (
                    <p className="mt-1 text-[10px] text-amber-700">
                      {sub.failedPaymentCount} failed attempt(s)
                    </p>
                  ) : null}
                </div>
              ) : null}
              {sub.stripeCustomerId ? (
                <a
                  href={`https://dashboard.stripe.com/customers/${sub.stripeCustomerId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#006e2f] hover:underline"
                >
                  Open in Stripe
                  <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              ) : null}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No subscription record.</p>
          )}
          <Link
            href="/admin/billing"
            className="mt-4 inline-block text-xs font-semibold text-emerald-700 hover:underline"
          >
            View billing dashboard
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <AdminSectionLabel>Job posts</AdminSectionLabel>
        {data.jobs.length === 0 ? (
          <p className="text-sm text-slate-500">No job posts yet.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {data.jobs.map((job) => (
              <li key={job.id}>
                <Link
                  href={`/admin/jobs/${job.id}`}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-emerald-200 transition-colors"
                >
                  <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{job.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <StatusBadge status={job.status} />
                      <span className="text-xs text-slate-400">
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
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.recentLedger.map((row) => (
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
        </section>
      ) : null}
    </div>
  );
}
