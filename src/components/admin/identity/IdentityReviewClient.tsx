"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, Check, X, FileImage, ChevronDown, ChevronUp, Clock, Files } from "lucide-react";
import { toast } from "sonner";
import {
  fetchWorkerVerificationDocuments,
  reviewWorkerVerification,
} from "@/actions/admin-actions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatCard } from "@/components/shared/StatCard";
import { AdminSectionLabel } from "@/components/admin/shared/AdminFilterPills";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import type {
  AdminVerificationDocument,
  AdminVerificationQueueRow,
} from "@/types/admin.types";

interface IdentityReviewClientProps {
  queue: AdminVerificationQueueRow[];
}

export function IdentityReviewClient({ queue }: IdentityReviewClientProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<
    Record<string, AdminVerificationDocument[]>
  >({});
  const [loadingDocs, setLoadingDocs] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [decision, setDecision] = useState<{
    workerId: string;
    name: string;
    type: "approved" | "rejected";
  } | null>(null);
  const [reason, setReason] = useState("");
  const router = useRouter();

  const toggleExpand = async (workerId: string) => {
    if (expandedId === workerId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(workerId);
    if (!documents[workerId]) {
      setLoadingDocs(workerId);
      try {
        const docs = await fetchWorkerVerificationDocuments(workerId);
        setDocuments((prev) => ({ ...prev, [workerId]: docs }));
      } catch {
        toast.error("Failed to load verification documents");
      } finally {
        setLoadingDocs(null);
      }
    }
  };

  const handleDecision = () => {
    if (!decision) return;
    startTransition(async () => {
      const result = await reviewWorkerVerification(
        decision.workerId,
        decision.type,
        reason || undefined
      );
      if (result.success) {
        toast.success(
          decision.type === "approved"
            ? "Worker verified"
            : "Verification rejected"
        );
        setDecision(null);
        setReason("");
        setExpandedId(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const totalDocuments = queue.reduce((sum, w) => sum + w.document_count, 0);

  if (queue.length === 0) {
    return (
      <EmptyState
        icon={<Fingerprint className="h-5 w-5" aria-hidden />}
        title="Verification queue is clear"
        description="Workers who submit identity documents will appear here for review."
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <AdminSectionLabel>Review queue</AdminSectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            variant="dashboard"
            title="Pending Review"
            value={queue.length}
            icon={<Clock className="h-4 w-4" aria-hidden />}
            iconBgClass="bg-amber-50"
            iconColorClass="text-amber-600"
          />
          <StatCard
            variant="dashboard"
            title="Documents Submitted"
            value={totalDocuments}
            icon={<Files className="h-4 w-4" aria-hidden />}
            iconBgClass="bg-blue-50"
            iconColorClass="text-blue-600"
          />
          <StatCard
            variant="dashboard"
            title="Workers in Queue"
            value={queue.length}
            icon={<Fingerprint className="h-4 w-4" aria-hidden />}
            iconBgClass="bg-[#ebfdf2]"
            iconColorClass="text-[#006e2f]"
          />
        </div>
      </section>

      <section className="space-y-4">
        <AdminSectionLabel>Pending submissions</AdminSectionLabel>
        <ul className="space-y-3">
      {queue.map((worker) => {
        const name =
          [worker.first_name, worker.last_name].filter(Boolean).join(" ") ||
          worker.email ||
          "Unknown worker";
        const isExpanded = expandedId === worker.id;
        const docs = documents[worker.id] ?? [];

        return (
          <li
            key={worker.id}
            className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
          >
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">{name}</p>
                <p className="text-xs text-slate-400">{worker.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <StatusBadge status={worker.verification_status} />
                  <span className="text-xs text-slate-500">
                    {worker.document_count} document
                    {worker.document_count === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleExpand(worker.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                  Documents
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    setDecision({
                      workerId: worker.id,
                      name,
                      type: "approved",
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-xl bg-[#006e2f] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#005c26] disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" aria-hidden />
                  Approve
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    setDecision({
                      workerId: worker.id,
                      name,
                      type: "rejected",
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                  Reject
                </button>
              </div>
            </div>

            {isExpanded ? (
              <div className="border-t border-slate-100 px-4 py-4">
                {loadingDocs === worker.id ? (
                  <p className="text-sm text-slate-400">Loading documents…</p>
                ) : docs.length === 0 ? (
                  <p className="text-sm text-slate-400">No documents on file.</p>
                ) : (
                  <ul className="grid gap-3 sm:grid-cols-3">
                    {docs.map((doc) => (
                      <li
                        key={doc.id}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                      >
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <FileImage className="h-4 w-4 text-slate-400" />
                          {doc.document_type.replace(/_/g, " ")}
                        </div>
                        <p className="mt-1 truncate text-[11px] text-slate-400">
                          {doc.file_name}
                        </p>
                        {doc.signed_url ? (
                          <a
                            href={doc.signed_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-block text-xs font-semibold text-[#006e2f] hover:underline"
                          >
                            View file
                          </a>
                        ) : (
                          <p className="mt-2 text-xs text-red-500">
                            Unable to generate preview URL
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </li>
        );
      })}
      </ul>
      </section>

      <ConfirmDialog
        open={decision !== null}
        title={
          decision?.type === "approved"
            ? "Approve verification?"
            : "Reject verification?"
        }
        description={
          decision?.type === "approved"
            ? `Mark ${decision?.name} as identity-verified.`
            : `Reject identity documents for ${decision?.name}.`
        }
        confirmLabel={decision?.type === "approved" ? "Approve" : "Reject"}
        variant={decision?.type === "rejected" ? "danger" : "default"}
        loading={pending}
        onCancel={() => {
          setDecision(null);
          setReason("");
        }}
        onConfirm={handleDecision}
      />

      {decision?.type === "rejected" ? (
        <label className="block max-w-md">
          <span className="text-xs font-medium text-slate-600">
            Rejection reason (optional, logged)
          </span>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      ) : null}
    </div>
  );
}
