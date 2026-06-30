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
    <div className="fixed inset-0 z-50 flex flex-col justify-end lg:justify-center">
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
        className="relative w-full overflow-y-auto rounded-t-3xl border border-slate-100 bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl lg:mx-auto lg:max-h-[min(85vh,820px)] lg:max-w-2xl lg:rounded-3xl lg:p-8"
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

