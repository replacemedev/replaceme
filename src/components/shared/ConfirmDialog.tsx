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

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/50 open:flex open:flex-col my-auto max-h-[85dvh] sm:max-h-[90vh] overflow-hidden outline-none"
      onClose={onCancel}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          onCancel();
        }
      }}
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 shrink-0 bg-white rounded-t-2xl">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              variant === "danger"
                ? "bg-red-50 text-red-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            <AlertTriangle className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {children ? (
        <div className="overflow-y-auto px-5 py-4 flex-1 min-h-[60px] max-h-[calc(85dvh-8rem)] text-slate-700">{children}</div>
      ) : null}
      <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 shrink-0 bg-slate-50/50 rounded-b-2xl">
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
            variant === "danger"
              ? "!bg-red-600 hover:!bg-red-700"
              : ""
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
