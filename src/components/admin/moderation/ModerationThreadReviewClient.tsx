"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldAlert, UserX, XCircle } from "lucide-react";
import {
  dismissModerationFlag,
  updateModerationFlagStatus,
} from "@/actions/admin/messaging-moderation";
import { suspendUser } from "@/actions/admin-actions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ACCOUNT_LIFECYCLE_TIMELINES } from "@/lib/data/legal";
import { CHAT_MODERATION_STATUS_LABELS } from "@/lib/reporting/messaging-moderation";
import type { AdminModerationThreadDetail } from "@/types/admin.types";

type DurationDays = 7 | 14 | 30 | 90 | null;
type DialogMode = "dismiss" | "resolve" | "suspend_worker" | "suspend_employer" | null;

interface ModerationThreadReviewClientProps {
  detail: AdminModerationThreadDetail;
}

export function ModerationThreadReviewClient({
  detail,
}: ModerationThreadReviewClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<DialogMode>(null);
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [durationDays, setDurationDays] = useState<DurationDays>(
    ACCOUNT_LIFECYCLE_TIMELINES.suspendDefaultDays as DurationDays
  );

  const reset = () => {
    setMode(null);
    setNotes("");
    setReason("");
    setDurationDays(
      ACCOUNT_LIFECYCLE_TIMELINES.suspendDefaultDays as DurationDays
    );
  };

  const run = () => {
    if (!mode) return;
    startTransition(async () => {
      if (mode === "dismiss") {
        if (notes.trim().length < 3) {
          toast.error("Add a short dismiss note");
          return;
        }
        const result = await dismissModerationFlag({
          flagId: detail.flagId,
          notes: notes.trim(),
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Flag dismissed");
        reset();
        router.push("/admin/moderation");
        router.refresh();
        return;
      }

      if (mode === "resolve") {
        const result = await updateModerationFlagStatus({
          flagId: detail.flagId,
          status: "resolved",
          notes: notes.trim() || "Resolved after review",
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Case resolved");
        reset();
        router.push("/admin/moderation");
        router.refresh();
        return;
      }

      const userId =
        mode === "suspend_worker" ? detail.workerId : detail.employerUserId;
      if (!userId) {
        toast.error("Could not resolve account");
        return;
      }
      if (reason.trim().length < 3) {
        toast.error("Enter a suspension reason");
        return;
      }
      const result = await suspendUser({
        userId,
        reason: reason.trim(),
        durationDays,
        notifyUser: true,
        reasonCategory: "policy",
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      await updateModerationFlagStatus({
        flagId: detail.flagId,
        status: "resolved",
        notes: `Suspended after review: ${reason.trim()}`,
      });
      toast.success("Account suspended");
      reset();
      router.push("/admin/moderation");
      router.refresh();
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] min-w-0 w-full max-w-full">
      <section className="min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col max-h-[min(70vh,720px)]">
        <header className="shrink-0 border-b border-slate-100 bg-slate-50/80 px-4 py-3 min-w-0">
          <p className="truncate text-sm font-bold text-slate-900 min-w-0">
            {detail.jobTitle ?? "Conversation"}
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-500 min-w-0">
            {detail.workerName ?? "Worker"} · {detail.companyName ?? "Company"}
          </p>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-w-0">
          {detail.messages.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">
              No messages in this thread.
            </p>
          ) : (
            detail.messages.map((msg) => {
              const isWorker = msg.sender_id === detail.workerId;
              return (
                <div
                  key={msg.id}
                  className={`flex min-w-0 ${isWorker ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[min(100%,28rem)] min-w-0 rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words ${
                      msg.is_flagged
                        ? "bg-amber-50 ring-2 ring-amber-400 text-slate-900 shadow-sm"
                        : isWorker
                          ? "bg-slate-100 text-slate-800"
                          : "bg-[#006e2f] text-white"
                    }`}
                  >
                    {msg.is_flagged ? (
                      <p className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                        <ShieldAlert className="h-3 w-3" aria-hidden />
                        Flagged message
                      </p>
                    ) : null}
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <p
                      className={`mt-1.5 text-[10px] font-medium ${
                        msg.is_flagged
                          ? "text-amber-700"
                          : isWorker
                            ? "text-slate-400"
                            : "text-white/70"
                      }`}
                    >
                      {isWorker ? "Worker" : "Employer"} ·{" "}
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <aside className="min-w-0 space-y-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3 min-w-0">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Case details
          </h3>
          <dl className="space-y-2 text-sm min-w-0">
            <div className="min-w-0">
              <dt className="text-[11px] font-semibold text-slate-400">Reason</dt>
              <dd className="font-semibold text-slate-900 break-words">
                {detail.reasonLabel}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold text-slate-400">Status</dt>
              <dd className="font-medium text-slate-800">
                {CHAT_MODERATION_STATUS_LABELS[detail.status]}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[11px] font-semibold text-slate-400">Worker</dt>
              <dd className="truncate text-slate-800">{detail.workerName ?? "—"}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[11px] font-semibold text-slate-400">Employer</dt>
              <dd className="truncate text-slate-800">
                {detail.companyName ?? "—"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2 min-w-0">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Actions
          </h3>
          <button
            type="button"
            onClick={() => setMode("resolve")}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#006e2f] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#005a27] transition-colors"
          >
            Mark resolved
          </button>
          <button
            type="button"
            onClick={() => setMode("dismiss")}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <XCircle className="h-4 w-4" aria-hidden />
            Dismiss flag
          </button>
          <button
            type="button"
            onClick={() => setMode("suspend_worker")}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
          >
            <UserX className="h-4 w-4" aria-hidden />
            Suspend worker
          </button>
          <button
            type="button"
            disabled={!detail.employerUserId}
            onClick={() => setMode("suspend_employer")}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-40"
          >
            <UserX className="h-4 w-4" aria-hidden />
            Suspend employer
          </button>
        </div>
      </aside>

      <ConfirmDialog
        open={mode !== null}
        size="md"
        title={
          mode === "dismiss"
            ? "Dismiss flag"
            : mode === "resolve"
              ? "Resolve case"
              : mode === "suspend_worker"
                ? "Suspend worker"
                : "Suspend employer"
        }
        description={
          mode === "dismiss" || mode === "resolve"
            ? "Add an optional internal note for the audit trail."
            : "Suspension notifies the user. Reporter identity stays confidential."
        }
        confirmLabel={
          mode === "dismiss"
            ? "Dismiss"
            : mode === "resolve"
              ? "Resolve"
              : "Suspend"
        }
        variant={
          mode === "suspend_worker" || mode === "suspend_employer"
            ? "danger"
            : "default"
        }
        loading={pending}
        onCancel={reset}
        onConfirm={run}
      >
        {mode === "dismiss" || mode === "resolve" ? (
          <label className="block text-sm font-semibold text-slate-700">
            Internal notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30"
              placeholder="Case notes…"
            />
          </label>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
              Reason
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30"
                placeholder="Suspension reason…"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Duration
              <select
                value={durationDays === null ? "indefinite" : String(durationDays)}
                onChange={(e) => {
                  const v = e.target.value;
                  setDurationDays(
                    v === "indefinite" ? null : (Number(v) as DurationDays)
                  );
                }}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800"
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="indefinite">Until further review</option>
              </select>
            </label>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
