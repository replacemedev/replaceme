"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { submitDataDeletionRequest } from "@/actions/privacy/deletion-request";
import {
  ACCOUNT_LIFECYCLE_TIMELINES,
  DATA_RETENTION_PERIODS,
  DELETION_REQUEST_SLA,
  DELETION_REQUEST_SUPPORT_EMAIL,
  addCalendarDays,
  formatClosureDate,
} from "@/lib/data/legal";

interface DataDeletionRequestCardProps {
  latestStatus?: { status: string; createdAt: string } | null;
  /** Optional explicit scheduled closure date; otherwise derived from createdAt + grace days. */
  scheduledFor?: string | Date | null;
}

export function DataDeletionRequestCard({
  latestStatus = null,
  scheduledFor = null,
}: DataDeletionRequestCardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const hasPending = latestStatus?.status === "pending" || latestStatus?.status === "in_progress";

  const closureDate =
    scheduledFor != null
      ? typeof scheduledFor === "string"
        ? new Date(scheduledFor)
        : scheduledFor
      : latestStatus?.createdAt
        ? addCalendarDays(
            latestStatus.createdAt,
            ACCOUNT_LIFECYCLE_TIMELINES.deletionGraceCalendarDays
          )
        : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmed) {
      toast.error("Please confirm you understand retention exceptions.");
      return;
    }
    startTransition(async () => {
      const result = await submitDataDeletionRequest({
        reason: reason.trim() || undefined,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        result.data?.message ?? "Deletion request submitted."
      );
      setReason("");
      setConfirmed(false);
      router.refresh();
    });
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      <div className="border-b border-slate-50 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <Trash2 className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-800">
              Request data deletion
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
              Exercise your right to erasure under RA 10173 and, where applicable, GDPR/CCPA.
              {` ${DELETION_REQUEST_SLA}`} Resolve active contracts, applications, job posts, and
              billing before closing.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Retention overview
          </h3>
          <ul className="space-y-2">
            {DATA_RETENTION_PERIODS.slice(0, 4).map((item) => (
              <li
                key={item.category}
                className="rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-sm"
              >
                <span className="font-semibold text-slate-800">{item.category}: </span>
                <span className="text-slate-600">{item.period}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-slate-500">
            Full schedule:{" "}
            <Link
              href="/privacy-policy#9-retention"
              className="font-semibold text-[#006e2f] hover:underline"
            >
              Privacy Policy §9
            </Link>
            . How closure works:{" "}
            <Link
              href="/help/account/close-delete"
              className="font-semibold text-[#006e2f] hover:underline"
            >
              Close or delete your account
            </Link>
            .
          </p>
        </div>

        {hasPending ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Your request is <strong className="font-semibold">{latestStatus?.status}</strong>
            {latestStatus?.createdAt
              ? ` (submitted ${new Date(latestStatus.createdAt).toLocaleDateString()})`
              : ""}
            .
            {closureDate && !Number.isNaN(closureDate.getTime()) ? (
              <>
                {" "}
                Scheduled closure / anonymization window ends on{" "}
                <strong className="font-semibold">{formatClosureDate(closureDate)}</strong> (
                {ACCOUNT_LIFECYCLE_TIMELINES.deletionGraceCalendarDays}-day grace from submission,
                unless we confirm a different date).
              </>
            ) : null}{" "}
            Please resolve any active work before that date. We will follow up at your account email.
            Questions:{" "}
            <a
              href={`mailto:${DELETION_REQUEST_SUPPORT_EMAIL}`}
              className="font-semibold underline"
            >
              {DELETION_REQUEST_SUPPORT_EMAIL}
            </a>
            .
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-1.5 text-sm font-medium text-slate-700">
              Reason (optional)
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Tell us anything that helps process your request…"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#006e2f]/50 focus:outline-none focus:ring-2 focus:ring-[#006e2f]/20"
              />
            </label>
            <label className="flex w-full cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-[#006e2f] focus:ring-2 focus:ring-[#006e2f]/40"
                required
              />
              <span className="min-w-0 text-sm leading-relaxed text-slate-600">
                I understand that some records (for example billing invoices or security logs) may be
                retained where the law requires, and that data already unlocked by an Employer is
                controlled by that Employer. I will resolve active work before closure.
              </span>
            </label>
            <button
              type="submit"
              disabled={pending || !confirmed}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {pending ? "Submitting…" : "Submit deletion request"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
