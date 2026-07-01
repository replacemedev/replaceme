"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { KeyRound, MoreHorizontal, PencilLine } from "lucide-react";
import { toast } from "sonner";
import { triggerOwnPasswordReset } from "@/actions/admin/team";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

interface AdminSelfPasswordActionsProps {
  variant?: "menu" | "card";
}

export function AdminSelfPasswordActions({
  variant = "menu",
}: AdminSelfPasswordActionsProps) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const closeMenu = () => {
    if (detailsRef.current) detailsRef.current.open = false;
    setOpen(false);
  };

  const sendResetEmail = () => {
    startTransition(async () => {
      const result = await triggerOwnPasswordReset();
      if (result.success) {
        toast.success("Password reset email sent");
        setConfirmReset(false);
        closeMenu();
      } else {
        toast.error(result.error ?? "Failed to send reset email");
      }
    });
  };

  if (variant === "card") {
    return (
      <>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link
            href="/update-password"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <PencilLine className="h-4 w-4 shrink-0" aria-hidden />
            Update password now
          </Link>
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <KeyRound className="h-4 w-4 shrink-0" aria-hidden />
            Email reset link
          </button>
        </div>

        <ConfirmDialog
          open={confirmReset}
          title="Send password reset email?"
          description="We will email you a secure link to set a new password."
          confirmLabel="Send reset email"
          loading={pending}
          onConfirm={sendResetEmail}
          onCancel={() => {
            if (pending) return;
            setConfirmReset(false);
          }}
        />
      </>
    );
  }

  return (
    <>
      <details
        ref={detailsRef}
        className="relative inline-block text-left"
        onToggle={(event) => setOpen((event.target as HTMLDetailsElement).open)}
      >
        <summary className="flex cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
          <MoreHorizontal className="h-4 w-4" aria-hidden />
          <span className="sr-only">Your account actions</span>
        </summary>
        {open ? (
          <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
            <Link
              href="/update-password"
              onClick={closeMenu}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <PencilLine className="h-4 w-4 shrink-0" aria-hidden />
              Update password now
            </Link>
            <button
              type="button"
              onClick={() => {
                setConfirmReset(true);
                closeMenu();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <KeyRound className="h-4 w-4 shrink-0" aria-hidden />
              Email reset link
            </button>
          </div>
        ) : null}
      </details>

      <ConfirmDialog
        open={confirmReset}
        title="Send password reset email?"
        description="We will email you a secure link to set a new password."
        confirmLabel="Send reset email"
        loading={pending}
        onConfirm={sendResetEmail}
        onCancel={() => {
          if (pending) return;
          setConfirmReset(false);
        }}
      />
    </>
  );
}
