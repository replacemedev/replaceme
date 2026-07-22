"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface ProfileModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export function ProfileModal({
  open,
  title,
  onClose,
  children,
  footer,
  maxWidth = "max-w-lg",
}: ProfileModalProps) {
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
      className={`fixed inset-0 z-50 m-auto w-[calc(100%-2rem)] ${maxWidth} rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/50 open:flex open:flex-col max-h-[85dvh] sm:max-h-[90vh] my-auto overflow-hidden outline-none`}
      onClose={onClose}
    >
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 shrink-0 bg-white rounded-t-2xl">
        <h2 className="text-sm sm:text-base font-bold text-slate-900">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
      <div className="overflow-y-auto px-5 py-4 flex-1 min-h-0">{children}</div>
      {footer ? (
        <div className="border-t border-slate-100 px-5 py-4 shrink-0 bg-slate-50/50 rounded-b-2xl">{footer}</div>
      ) : null}
    </dialog>
  );
}
