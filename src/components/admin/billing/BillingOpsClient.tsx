"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { adminOverrideSubscriptionUsage } from "@/actions/admin-actions";
import {
  adminIssueStripeRefund,
  adminOverrideEmployerPlan,
  adminRevokeEmployerPlanOverride,
} from "@/actions/admin/billing";
import { AdminSectionLabel } from "@/components/admin/shared/AdminFilterPills";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { TablePagination } from "@/components/shared/TablePagination";
import type { AdminSubscriptionRow } from "@/types/admin.types";

interface BillingOpsClientProps {
  subscriptions: AdminSubscriptionRow[];
}

export function BillingOpsClient({ subscriptions }: BillingOpsClientProps) {
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [jobPosts, setJobPosts] = useState(0);
  const [unlocks, setUnlocks] = useState(0);
  const [note, setNote] = useState("");
  const [planSlug, setPlanSlug] = useState("growth");
  const [expiresDays, setExpiresDays] = useState("30");
  const [paymentRef, setPaymentRef] = useState("");
  const [refundCents, setRefundCents] = useState("");
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const atRisk = subscriptions.filter(
    (s) =>
      s.status === "past_due" ||
      s.status === "unpaid" ||
      s.status === "incomplete" ||
      Boolean(s.stripe_dispute_status)
  );

  if (subscriptions.length === 0) {
    return (
      <EmptyState
        icon={<DollarSign className="h-5 w-5" aria-hidden />}
        title="No billing records"
        description="Employer subscriptions will appear here for usage overrides and ops review."
      />
    );
  }

  const startEdit = (sub: AdminSubscriptionRow) => {
    setEditingId(sub.id);
    setJobPosts(sub.job_posts_used);
    setUnlocks(sub.unlocks_used);
    setNote("");
    setPlanSlug(sub.plan_slug ?? "growth");
    setExpiresDays("30");
    setPaymentRef("");
    setRefundCents("");
  };

  const submitUsage = (subscriptionId: string) => {
    startTransition(async () => {
      const result = await adminOverrideSubscriptionUsage(
        subscriptionId,
        jobPosts,
        unlocks,
        note.trim() || "Admin usage override"
      );
      if (result.success) {
        toast.success("Subscription usage updated");
        setEditingId(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const submitPlanOverride = (employerId: string) => {
    startTransition(async () => {
      const days = expiresDays.trim() ? Number(expiresDays) : null;
      const result = await adminOverrideEmployerPlan({
        employerId,
        planSlug: planSlug as "discovery" | "starter" | "growth" | "scale",
        expiresInDays: days && !Number.isNaN(days) ? days : null,
        reason: note.trim() || "Admin plan override",
      });
      if (result.success) {
        toast.success("Plan override granted");
        setEditingId(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const revokeOverride = (employerId: string) => {
    startTransition(async () => {
      const result = await adminRevokeEmployerPlanOverride({
        employerId,
        reason: note.trim() || "Admin revoked plan override",
      });
      if (result.success) {
        toast.success("Plan override revoked");
        setEditingId(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const submitRefund = (employerId: string) => {
    startTransition(async () => {
      const cents = refundCents.trim() ? Number(refundCents) : null;
      const result = await adminIssueStripeRefund({
        employerId,
        stripePaymentRef: paymentRef.trim(),
        amountCents: cents && !Number.isNaN(cents) ? cents : null,
        reason: "requested_by_customer",
        note: note.trim() || "Admin refund",
      });
      if (result.success) {
        toast.success("Refund issued");
        setEditingId(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const totalItems = subscriptions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const activePage = Math.min(currentPage, totalPages || 1);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedSubscriptions = subscriptions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <section className="space-y-4">
      <AdminSectionLabel>Billing operations</AdminSectionLabel>
      <p className="text-xs text-slate-500">
        Usage counters, VIP plan overrides, and Stripe refunds. Chargebacks
        sync automatically from webhooks.
      </p>

      {atRisk.length > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3">
          <p className="text-sm font-semibold text-amber-950">
            At risk ({atRisk.length})
          </p>
          <ul className="mt-2 space-y-1 text-xs text-amber-900">
            {atRisk.slice(0, 8).map((s) => (
              <li key={s.id}>
                {s.company_name ?? s.employer_email ?? s.employer_id} —{" "}
                <StatusBadge status={s.status} />
                {s.stripe_dispute_status
                  ? ` · dispute: ${s.stripe_dispute_status}`
                  : null}
                {s.last_payment_error ? ` · ${s.last_payment_error}` : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="space-y-4">
        <div className="overflow-x-auto w-full max-w-full rounded-lg shadow-sm border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-4 py-3">Employer</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Usage / Ops</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedSubscriptions.map((sub) => (
                <tr key={sub.id} className="align-top hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">
                      {sub.company_name ?? "—"}
                    </p>
                    <p className="text-xs text-slate-400">{sub.employer_email}</p>
                    {sub.override_plan_id ? (
                      <p className="mt-1 text-[11px] font-medium text-violet-700">
                        VIP override
                        {sub.override_expires_at
                          ? ` until ${new Date(sub.override_expires_at).toLocaleDateString()}`
                          : " (permanent)"}
                      </p>
                    ) : null}
                    {sub.stripe_dispute_status ? (
                      <p className="mt-1 text-[11px] font-medium text-red-700">
                        Dispute: {sub.stripe_dispute_status}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {sub.plan_name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={sub.status} />
                    {sub.last_payment_error ? (
                      <p className="mt-1 max-w-[12rem] text-[11px] text-amber-700">
                        {sub.last_payment_error}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {editingId === sub.id ? (
                      <div className="flex flex-col gap-2 min-w-[220px]">
                        <label className="flex items-center gap-2">
                          <span className="w-20">Job posts</span>
                          <input
                            type="number"
                            min={0}
                            value={jobPosts}
                            onChange={(e) => setJobPosts(Number(e.target.value))}
                            className="w-20 rounded border border-slate-200 px-2 py-1"
                          />
                        </label>
                        <label className="flex items-center gap-2">
                          <span className="w-20">Unlocks</span>
                          <input
                            type="number"
                            min={0}
                            value={unlocks}
                            onChange={(e) => setUnlocks(Number(e.target.value))}
                            className="w-20 rounded border border-slate-200 px-2 py-1"
                          />
                        </label>
                        <select
                          value={planSlug}
                          onChange={(e) => setPlanSlug(e.target.value)}
                          className="rounded border border-slate-200 px-2 py-1"
                        >
                          <option value="discovery">Discovery</option>
                          <option value="starter">Starter</option>
                          <option value="growth">Growth</option>
                          <option value="scale">Scale</option>
                        </select>
                        <input
                          type="number"
                          min={1}
                          placeholder="Override days (blank=permanent)"
                          value={expiresDays}
                          onChange={(e) => setExpiresDays(e.target.value)}
                          className="rounded border border-slate-200 px-2 py-1"
                        />
                        <input
                          type="text"
                          placeholder="pi_… or ch_… for refund"
                          value={paymentRef}
                          onChange={(e) => setPaymentRef(e.target.value)}
                          className="rounded border border-slate-200 px-2 py-1"
                        />
                        <input
                          type="number"
                          min={1}
                          placeholder="Partial refund cents (blank=full)"
                          value={refundCents}
                          onChange={(e) => setRefundCents(e.target.value)}
                          className="rounded border border-slate-200 px-2 py-1"
                        />
                        <input
                          type="text"
                          placeholder="Reason / note"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="rounded border border-slate-200 px-2 py-1"
                        />
                      </div>
                    ) : (
                      <>
                        Job posts: {sub.job_posts_used}
                        <br />
                        Unlocks: {sub.unlocks_used}
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingId === sub.id ? (
                      <div className="flex flex-col gap-2 items-end">
                        <Button
                          type="button"
                          size="sm"
                          disabled={pending}
                          onClick={() => submitUsage(sub.id)}
                        >
                          {pending ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          ) : (
                            "Save usage"
                          )}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={pending}
                          onClick={() => submitPlanOverride(sub.employer_id)}
                        >
                          Grant plan
                        </Button>
                        {sub.override_plan_id ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={pending}
                            onClick={() => revokeOverride(sub.employer_id)}
                          >
                            Revoke override
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={pending || !paymentRef.trim()}
                          onClick={() => submitRefund(sub.employer_id)}
                        >
                          Issue refund
                        </Button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-xs text-slate-500 hover:text-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEdit(sub)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Manage
                      </button>
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
  );
}
