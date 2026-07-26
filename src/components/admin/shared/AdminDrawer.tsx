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
  /** Wider panel for side-by-side layouts (e.g. KYC image compare). */
  size?: "narrow" | "default" | "wide";
}

const DRAWER_WIDTH: Record<NonNullable<AdminDrawerProps["size"]>, string> = {
  // Task: mobile full-bleed, sm+ max-w-md for profile deep-dives
  narrow: "w-full sm:max-w-md",
  default: "w-full max-w-full md:max-w-xl",
  wide: "w-full max-w-full md:max-w-3xl lg:max-w-5xl",
};

export function AdminDrawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "default",
}: AdminDrawerProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      closeBtnRef.current?.focus();
    }
  }, [open]);

  // Body scroll lock — required for iOS Safari background scroll bleed
  useEffect(() => {
    if (!open) return;

    const body = document.body;
    const html = document.documentElement;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyTouchAction = body.style.touchAction;
    const scrollY = window.scrollY;

    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    body.style.touchAction = "none";
    // iOS Safari: freeze scroll position while drawer is open
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;
      body.style.touchAction = prevBodyTouchAction;
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [open]);

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
      <button
        type="button"
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out ${
          open ? "opacity-100" : "opacity-0"
        }`}
        aria-label="Close drawer"
        disabled={!open}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex h-[100dvh] max-h-[100dvh] max-w-full ${DRAWER_WIDTH[size]} flex-col overflow-hidden bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-5 py-4">
          <div className="min-w-0 pr-3">
            <h2 className="truncate text-base font-extrabold text-slate-900">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm font-medium text-slate-500">
                {description}
              </p>
            ) : null}
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-white p-4 md:p-6 [-webkit-overflow-scrolling:touch]">
          {children}
        </div>

        {footer ? (
          <div className="shrink-0 border-t bg-slate-50 p-4">{footer}</div>
        ) : null}
      </aside>
    </div>
  );
}
