"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface ProfileModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function ProfileModal({
  open,
  title,
  onClose,
  children,
  footer,
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
      className="fixed inset-0 z-50 m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 open:flex open:flex-col max-h-[90vh]"
      onClose={onClose}
    >
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 shrink-0">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="overflow-y-auto px-5 py-4 flex-1">{children}</div>
      {footer ? (
        <div className="border-t border-slate-100 px-5 py-4 shrink-0">{footer}</div>
      ) : null}
    </dialog>
  );
}
