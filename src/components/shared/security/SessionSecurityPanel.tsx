"use client";

import { useState, useTransition } from "react";
import { Loader2, LogOut, MonitorSmartphone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  revokeAllSessionsAndSignOut,
  revokeOtherSessions,
} from "@/actions/sessions";

type SessionSecurityPanelProps = {
  /** Compact for embedding in admin/settings cards */
  variant?: "page" | "card";
  className?: string;
};

export function SessionSecurityPanel({
  variant = "page",
  className = "",
}: SessionSecurityPanelProps) {
  const [pendingOthers, startOthers] = useTransition();
  const [pendingAll, startAll] = useTransition();
  const [confirmAll, setConfirmAll] = useState(false);

  const busy = pendingOthers || pendingAll;

  function handleRevokeOthers() {
    startOthers(async () => {
      const result = await revokeOtherSessions();
      if (result.success) toast.success(result.message);
      else toast.error(result.error);
    });
  }

  function handleRevokeAll() {
    if (!confirmAll) {
      setConfirmAll(true);
      return;
    }
    startAll(async () => {
      const toastId = toast.loading("Signing out everywhere…");
      try {
        await revokeAllSessionsAndSignOut();
      } catch {
        // redirect throws; ignore
      } finally {
        toast.dismiss(toastId);
      }
    });
  }

  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] ${
        variant === "page" ? "p-5 sm:p-6" : "p-5"
      } ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ebfdf2] text-[#006e2f]">
          <MonitorSmartphone className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 sm:text-base">
              Active sessions
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              If you used a shared computer or see unexpected activity, sign out
              other devices. Access tokens may remain valid until they expire;
              refresh tokens are revoked immediately.
            </p>
          </div>

          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex gap-2">
              <ShieldCheck
                className="mt-0.5 h-4 w-4 shrink-0 text-[#006e2f]"
                aria-hidden
              />
              <span>
                <span className="font-semibold text-slate-800">This device</span>
                {" — "}stays signed in when you revoke others.
              </span>
            </li>
            <li className="flex gap-2">
              <LogOut
                className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                aria-hidden
              />
              <span>
                <span className="font-semibold text-slate-800">
                  Sign out everywhere
                </span>
                {" — "}ends this session too and returns you to sign in.
              </span>
            </li>
          </ul>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              disabled={busy}
              onClick={handleRevokeOthers}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 transition-colors hover:border-[#006e2f]/40 hover:bg-[#ebfdf2]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 disabled:opacity-50 sm:w-auto"
            >
              {pendingOthers ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              Sign out other devices
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={handleRevokeAll}
              className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:opacity-50 sm:w-auto ${
                confirmAll
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              }`}
            >
              {pendingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              {confirmAll ? "Confirm: sign out everywhere" : "Sign out everywhere"}
            </button>

            {confirmAll ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirmAll(false)}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold text-slate-500 hover:text-slate-800 sm:w-auto"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
