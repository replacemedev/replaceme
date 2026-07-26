"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { reportMessagingThread } from "@/actions/admin/messaging-moderation";
import {
  USER_REPORT_VIOLATIONS,
  USER_REPORT_VIOLATION_LABELS,
  type UserReportViolation,
} from "@/lib/reporting/constants";

interface ReportConversationDialogProps {
  open: boolean;
  threadId: string;
  onClose: () => void;
}

export function ReportConversationDialog({
  open,
  threadId,
  onClose,
}: ReportConversationDialogProps) {
  const [pending, startTransition] = useTransition();
  const [violationCategory, setViolationCategory] =
    useState<UserReportViolation>("harassment");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  if (!open) return null;

  const submit = () => {
    startTransition(async () => {
      const result = await reportMessagingThread({
        threadId,
        violationCategory,
        title: title.trim(),
        description: description.trim(),
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Report submitted. Our Trust & Safety team will review.");
      setTitle("");
      setDescription("");
      setViolationCategory("harassment");
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        role="dialog"
        aria-labelledby="report-conversation-title"
        className="bg-white rounded-3xl p-6 shadow-xl max-w-md w-full max-h-[min(90vh,640px)] overflow-y-auto border border-slate-100 min-w-0"
      >
        <h4
          id="report-conversation-title"
          className="text-base font-bold text-slate-900"
        >
          Report conversation
        </h4>
        <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-500">
          Reports are confidential. Your identity is not shared with the other
          party. Trust &amp; Safety reviews flagged messages for justified cause
          only.
        </p>

        <div className="mt-4 space-y-3 min-w-0">
          <label className="block text-sm font-semibold text-slate-700">
            Category
            <select
              value={violationCategory}
              onChange={(e) =>
                setViolationCategory(e.target.value as UserReportViolation)
              }
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800"
            >
              {USER_REPORT_VIOLATIONS.map((v) => (
                <option key={v} value={v}>
                  {USER_REPORT_VIOLATION_LABELS[v]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30"
              placeholder="Brief summary"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Details
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={2000}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30"
              placeholder="Describe what happened…"
            />
          </label>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="h-10 rounded-xl px-4 text-xs font-bold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 cursor-pointer w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="h-10 rounded-xl px-4 text-xs font-bold bg-[#006e2f] hover:bg-[#005a27] text-white disabled:opacity-50 cursor-pointer w-full sm:w-auto"
          >
            {pending ? "Submitting…" : "Submit report"}
          </button>
        </div>
      </div>
    </div>
  );
}
