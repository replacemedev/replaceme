"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { ReportIssueForm } from "./ReportIssueForm";

export function ReportIssueSlideover({
  open,
  onClose,
  title = "Report an issue",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
}) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastActiveRef.current = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) return;
    lastActiveRef.current?.focus?.();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        aria-label="Close report panel"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-100 bg-white p-5 pb-6 shadow-2xl md:p-8 max-w-xl md:max-w-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
              {title}
            </h2>
            <p className="text-sm font-medium text-slate-600">
              Share what happened. We’ll triage and follow up quickly.
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ReportIssueForm onSubmitted={onClose} />
      </div>
    </div>
  );
}

