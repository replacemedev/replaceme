"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Scale, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateDisputeStatus } from "@/actions/admin-actions";
import { AdminFilterPills, AdminSectionLabel } from "@/components/admin/shared/AdminFilterPills";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import type { AdminDisputeRow, DisputeStatus } from "@/types/admin.types";

const STATUS_FILTERS = [
  "All",
  "Open",
  "Under review",
  "Resolved",
  "Closed",
] as const;

const STATUS_VALUE_MAP: Record<string, string> = {
  All: "all",
  Open: "open",
  "Under review": "under_review",
  Resolved: "resolved",
  Closed: "closed",
};

const STATUS_LABEL_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_VALUE_MAP).map(([label, value]) => [value, label])
);

interface DisputesClientProps {
  disputes: AdminDisputeRow[];
}

export function DisputesClient({ disputes }: DisputesClientProps) {
  const [filter, setFilter] = useState<string>("All");
  const [pending, startTransition] = useTransition();
  const [activeId, setActiveId] = useState<string | null>(null);
  const router = useRouter();

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { All: disputes.length };
    for (const d of disputes) {
      const label = STATUS_LABEL_MAP[d.status] ?? d.status;
      counts[label] = (counts[label] ?? 0) + 1;
    }
    return counts;
  }, [disputes]);

  const filterValue = STATUS_VALUE_MAP[filter] ?? "all";
  const filtered =
    filterValue === "all"
      ? disputes
      : disputes.filter((d) => d.status === filterValue);

  const handleStatusChange = (disputeId: string, status: DisputeStatus) => {
    setActiveId(disputeId);
    startTransition(async () => {
      const result = await updateDisputeStatus(disputeId, status);
      setActiveId(null);
      if (result.success) {
        toast.success("Dispute updated");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  if (disputes.length === 0) {
    return (
      <EmptyState
        icon={<Scale className="h-5 w-5" aria-hidden />}
        title="No disputes filed"
        description="Worker safety reports and mediation cases will appear here for review."
      />
    );
  }

  return (
    <div className="space-y-4">
      <AdminFilterPills
        options={STATUS_FILTERS}
        value={filter}
        onChange={setFilter}
        counts={filterCounts}
      />
      <section className="space-y-4">
        <AdminSectionLabel>Mediation queue</AdminSectionLabel>
        <ul className="space-y-3">
          {filtered.map((dispute) => (
            <li
              key={dispute.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{dispute.title}</p>
                  {dispute.description ? (
                    <p className="mt-1 text-sm text-slate-600">{dispute.description}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-slate-500">
                    {dispute.worker_name ?? "Unknown worker"}
                    {dispute.worker_email ? ` · ${dispute.worker_email}` : ""}
                  </p>
                  <p className="text-xs text-slate-400">
                    Filed {new Date(dispute.created_at).toLocaleString()}
                  </p>
                </div>
                <StatusBadge status={dispute.status} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(["under_review", "resolved", "closed"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={pending || dispute.status === status}
                    onClick={() => handleStatusChange(dispute.id, status)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {pending && activeId === dispute.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                    ) : null}
                    Mark {status.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
