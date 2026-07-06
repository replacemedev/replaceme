"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createJobReport } from "@/actions/reports";

interface ReportJobModalProps {
  open: boolean;
  jobId: string;
  jobTitle: string;
  onClose: () => void;
}

const REPORT_REASONS = [
  "Inaccurate Agent Skills Required (e.g., Ponytail)",
  "Spam or misleading information",
  "Inappropriate or offensive content",
  "Scam, fraud, or phishing",
  "Other issues",
];

export function ReportJobModal({
  open,
  jobId,
  jobTitle,
  onClose,
}: ReportJobModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // Reset form fields when opened
      setReason(REPORT_REASONS[0]);
      setDescription("");
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 10) {
      toast.error("Please provide a description with at least 10 characters.");
      return;
    }

    startTransition(async () => {
      const result = await createJobReport({
        jobId,
        reason,
        description: description.trim(),
      });

      if (!result.success) {
        toast.error(result.error ?? "Failed to submit report.");
        return;
      }

      toast.success("Job report submitted successfully.");
      onClose();
    });
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-auto w-[calc(100vw-2rem)] max-w-lg rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm open:flex open:flex-col max-h-[90vh] transition-all duration-300 transform scale-100"
      onClose={onClose}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 shrink-0 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <AlertTriangle className="h-4 w-4" aria-hidden />
          </span>
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">
            Report Job Post
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <div className="overflow-y-auto px-5 py-5 flex-1 space-y-4">
          <div className="rounded-xl bg-slate-50 border border-slate-150 p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Reporting Job
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800 line-clamp-1">
              {jobTitle}
            </p>
          </div>

          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Reason for reporting
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all hover:bg-slate-50/50 ${
                    reason === r
                      ? "border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="report_reason"
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    disabled={isPending}
                    className="mt-0.5 h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-700 leading-tight">
                    {r}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Description Context */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Additional description
            </label>
            <textarea
              required
              disabled={isPending}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Please provide details about the issue with this job post (min 10 characters)..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all resize-none"
            />
            <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400">
              <span>Min 10 characters</span>
              <span>{description.trim().length} / 1000</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-5 py-4 shrink-0 bg-slate-50/50 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-extrabold text-white transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit Report"
            )}
          </button>
        </div>
      </form>
    </dialog>
  );
}
