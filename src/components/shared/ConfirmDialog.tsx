"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  loading?: boolean;
  children?: ReactNode;
  /** Wider panel for denser forms (e.g. account deletion). */
  size?: "md" | "lg";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  children,
  size = "md",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  const maxWidth =
    size === "lg" ? "sm:max-w-lg" : "sm:max-w-md";

  return (
    <dialog
      ref={dialogRef}
      dir="ltr"
      className={`fixed inset-0 z-[100] m-0 sm:m-auto h-full max-h-full w-full max-w-none rounded-none border-0 sm:border sm:border-slate-200 bg-white p-0 text-left shadow-2xl backdrop:bg-slate-900/50 open:flex open:flex-col sm:h-auto sm:max-h-[90vh] sm:w-[calc(100%-2rem)] sm:rounded-2xl ${maxWidth} overflow-hidden outline-none overscroll-contain`}
      onClose={onCancel}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          onCancel();
        }
      }}
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 shrink-0 bg-white sm:rounded-t-2xl text-left">
        <div className="flex items-start gap-3 min-w-0 text-left">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              variant === "danger"
                ? "bg-red-50 text-red-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            <AlertTriangle className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 text-left">
            <h2 className="text-base font-bold text-slate-900 leading-snug text-left">
              {title}
            </h2>
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed text-left">
              {description}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {children ? (
        <div className="overflow-y-auto overflow-x-hidden overscroll-contain px-6 py-5 flex-1 min-h-0 text-left text-slate-700">
          {children}
        </div>
      ) : null}
      <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4 shrink-0 bg-slate-50/50 sm:rounded-b-2xl pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="!w-auto"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          size="sm"
          className={`!w-auto ${
            variant === "danger" ? "!bg-red-600 hover:!bg-red-700" : ""
          }`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Processing…" : confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
