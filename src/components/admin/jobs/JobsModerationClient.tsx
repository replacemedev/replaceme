"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Check, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  approveJobPost,
  deleteJobPost,
  rejectJobPost,
} from "@/actions/admin-actions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import type { AdminJobRow } from "@/types/admin.types";

const STATUS_FILTERS = [
  "All",
  "Pending Review",
  "Active",
  "Closed",
  "Draft",
] as const;

interface JobsModerationClientProps {
  jobs: AdminJobRow[];
  initialFilter?: string;
}

export function JobsModerationClient({
  jobs,
  initialFilter = "Pending Review",
}: JobsModerationClientProps) {
  const [filter, setFilter] = useState(initialFilter);
  const [pending, startTransition] = useTransition();
  const [rejectTarget, setRejectTarget] = useState<AdminJobRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminJobRow | null>(null);
  const [reason, setReason] = useState("");
  const router = useRouter();

  const filtered = useMemo(() => {
    if (filter === "All") return jobs;
    return jobs.filter((j) => j.status === filter);
  }, [jobs, filter]);

  const handleApprove = (jobId: string) => {
    startTransition(async () => {
      const result = await approveJobPost(jobId);
      if (result.success) toast.success("Job approved and published");
      else toast.error(result.error);
      if (result.success) router.refresh();
    });
  };

  const handleReject = () => {
    if (!rejectTarget) return;
    startTransition(async () => {
      const result = await rejectJobPost(
        rejectTarget.id,
        reason || "Did not meet posting guidelines"
      );
      if (result.success) {
        toast.success("Job rejected");
        setRejectTarget(null);
        setReason("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteJobPost(
        deleteTarget.id,
        reason || "Removed by admin"
      );
      if (result.success) {
        toast.success("Job deleted");
        setDeleteTarget(null);
        setReason("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === status
                ? "bg-emerald-500 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-5 w-5" aria-hidden />}
          title="No jobs in this queue"
          description="Job posts matching this filter will appear here."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Employer</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Salary</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{job.title}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {job.company_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {job.employment_type}
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                    ${job.monthly_salary.toLocaleString()}/mo
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {job.status === "Pending Review" ? (
                        <>
                          <ActionBtn
                            label="Approve"
                            icon={Check}
                            className="text-emerald-700 hover:bg-emerald-50"
                            disabled={pending}
                            onClick={() => handleApprove(job.id)}
                          />
                          <ActionBtn
                            label="Reject"
                            icon={X}
                            className="text-amber-700 hover:bg-amber-50"
                            disabled={pending}
                            onClick={() => setRejectTarget(job)}
                          />
                        </>
                      ) : null}
                      <ActionBtn
                        label="Delete"
                        icon={Trash2}
                        className="text-red-600 hover:bg-red-50"
                        disabled={pending}
                        onClick={() => setDeleteTarget(job)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={rejectTarget !== null}
        title="Reject job post?"
        description={`"${rejectTarget?.title}" will be closed and hidden from workers.`}
        confirmLabel="Reject"
        variant="danger"
        loading={pending}
        onCancel={() => {
          setRejectTarget(null);
          setReason("");
        }}
        onConfirm={handleReject}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete job post?"
        description={`Permanently remove "${deleteTarget?.title}". This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={pending}
        onCancel={() => {
          setDeleteTarget(null);
          setReason("");
        }}
        onConfirm={handleDelete}
      />

      {(rejectTarget || deleteTarget) && (
        <label className="block max-w-md">
          <span className="text-xs font-medium text-slate-600">
            Reason (audit log)
          </span>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      )}
    </div>
  );
}

function ActionBtn({
  label,
  icon: Icon,
  className,
  disabled,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold disabled:opacity-50 ${className}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <span className="sr-only sm:not-sr-only">{label}</span>
    </button>
  );
}
