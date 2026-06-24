import { DollarSign } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import type { AdminSubscriptionRow } from "@/types/admin.types";

interface RevenueClientProps {
  subscriptions: AdminSubscriptionRow[];
}

export function RevenueClient({ subscriptions }: RevenueClientProps) {
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

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SummaryCard label="Active subscriptions" value={String(activeCount)} />
        <SummaryCard
          label="Estimated MRR"
          value={`$${mrr.toLocaleString()}`}
        />
      </section>

      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <th className="px-4 py-3">Employer</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Usage</th>
              <th className="px-4 py-3">Period end</th>
              <th className="px-4 py-3">Stripe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">
                    {sub.company_name ?? "—"}
                  </p>
                  <p className="text-xs text-slate-400">{sub.employer_email}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-slate-700">{sub.plan_name ?? "—"}</p>
                  {sub.plan_price != null ? (
                    <p className="text-xs text-slate-400 font-mono">
                      ${sub.plan_price}/mo
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={sub.status} />
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {sub.job_posts_used} posts · {sub.unlocks_used} unlocks
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
                      className="text-xs font-semibold text-violet-600 hover:underline"
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
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-2 text-2xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}
