"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface AdminDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AdminDrawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: AdminDrawerProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      closeBtnRef.current?.focus();
    }
  }, [open]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[80] flex justify-end transition-all duration-300 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Backdrop Overlay */}
      <button
        type="button"
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out ${
          open ? "opacity-100" : "opacity-0"
        }`}
        aria-label="Close drawer"
        disabled={!open}
      />

      {/* Drawer container sliding in from the right */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex h-full w-full max-w-full md:max-w-xl flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 shrink-0">
          <div className="min-w-0">
            <h2 className="text-base font-extrabold text-slate-900 truncate">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm font-medium text-slate-500">
                {description}
              </p>
            )}
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t bg-slate-50 shrink-0">
            {footer}
          </div>
        )}
      </aside>
    </div>
  );
}
