"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { adminOverrideSubscriptionUsage } from "@/actions/admin-actions";
import { AdminSectionLabel } from "@/components/admin/shared/AdminFilterPills";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { Button } from "@/components/ui/button";
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
  const router = useRouter();

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
  };

  const submitOverride = (subscriptionId: string) => {
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

  return (
    <section className="space-y-4">
      <AdminSectionLabel>Billing operations</AdminSectionLabel>
      <p className="text-xs text-slate-500">
        Adjust job-post and unlock counters for support cases. Stripe refunds and
        dispute handling remain in the Stripe dashboard.
      </p>
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <th className="px-4 py-3">Employer</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Usage</th>
              <th className="px-4 py-3 text-right">Ops</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="align-top hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">
                    {sub.company_name ?? "—"}
                  </p>
                  <p className="text-xs text-slate-400">{sub.employer_email}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{sub.plan_name ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={sub.status} />
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">
                  {editingId === sub.id ? (
                    <div className="flex flex-col gap-2">
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
                      <input
                        type="text"
                        placeholder="Override note"
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
                        onClick={() => submitOverride(sub.id)}
                        className="w-auto"
                      >
                        {pending ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        ) : (
                          "Save"
                        )}
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
                      Override usage
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
