"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CookieConsentModalProps {
  open: boolean;
  analytics: boolean;
  marketing: boolean;
  saving?: boolean;
  onAnalyticsChange: (value: boolean) => void;
  onMarketingChange: (value: boolean) => void;
  onSave: () => void;
  onAcceptAll: () => void;
  onRejectNonEssential: () => void;
  onClose: () => void;
}

function ConsentToggle({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <li className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          checked ? "bg-[#006e2f]" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </li>
  );
}

export function CookieConsentModal({
  open,
  analytics,
  marketing,
  saving = false,
  onAnalyticsChange,
  onMarketingChange,
  onSave,
  onAcceptAll,
  onRejectNonEssential,
  onClose,
}: CookieConsentModalProps) {
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
      className="fixed inset-0 z-[70] m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/50 open:flex open:flex-col my-auto h-[85dvh] sm:h-auto sm:max-h-[90vh] overflow-hidden outline-none"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 shrink-0 bg-white rounded-t-2xl">
        <div>
          <h2 className="text-base font-bold text-slate-900">Cookie preferences</h2>
          <p className="mt-1 text-sm text-slate-600">
            Choose which optional cookies we may use. See our{" "}
            <Link href="/cookie-policy" className="font-semibold text-[#006e2f] hover:underline">
              Cookie Policy
            </Link>
            .
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Close cookie preferences"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <ul className="space-y-3 px-5 py-4 flex-1 min-h-0 overflow-y-auto text-slate-700">
        <ConsentToggle
          label="Strictly necessary"
          description="Required for sign-in, security, and core marketplace features. Always on."
          checked
          disabled
          onChange={() => {}}
        />
        <ConsentToggle
          label="Analytics"
          description="Helps us understand how the site is used so we can improve the product."
          checked={analytics}
          onChange={onAnalyticsChange}
        />
        <ConsentToggle
          label="Marketing"
          description="Used for advertising, retargeting, or campaign measurement."
          checked={marketing}
          onChange={onMarketingChange}
        />
      </ul>

      <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 shrink-0 bg-slate-50/50 rounded-b-2xl sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="!w-full sm:!w-auto"
          disabled={saving}
          onClick={onRejectNonEssential}
        >
          Reject non-essential
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="!w-full sm:!w-auto"
          disabled={saving}
          onClick={onAcceptAll}
        >
          Accept all
        </Button>
        <Button
          type="button"
          size="sm"
          className="!w-full sm:!w-auto"
          disabled={saving}
          onClick={onSave}
        >
          {saving ? "Saving…" : "Save preferences"}
        </Button>
      </div>
    </dialog>
  );
}
