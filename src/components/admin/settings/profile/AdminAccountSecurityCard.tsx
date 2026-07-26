"use client";

import { useState, useTransition } from "react";
import { KeyRound, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { changePassword } from "@/actions/auth";
import { triggerOwnPasswordReset } from "@/actions/admin/team";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";

const inputClassName =
  "w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/40";

export function AdminAccountSecurityCard() {
  const [pending, startTransition] = useTransition();
  const [resetPending, startResetTransition] = useTransition();
  const [confirmReset, setConfirmReset] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await changePassword({
        currentPassword,
        password,
        confirmPassword,
      });
      if (result.success) {
        toast.success("Password updated");
        setCurrentPassword("");
        setPassword("");
        setConfirmPassword("");
      } else {
        toast.error(result.error ?? "Could not update password");
      }
    });
  };

  const sendResetEmail = () => {
    startResetTransition(async () => {
      const result = await triggerOwnPasswordReset();
      if (result.success) {
        toast.success("Password reset email sent");
        setConfirmReset(false);
      } else {
        toast.error(result.error ?? "Failed to send reset email");
      }
    });
  };

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex items-start gap-3 border-b border-slate-50 p-5 sm:p-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ebfdf2] text-[#006e2f]">
            <Shield className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-800">Account security</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-400 sm:text-sm">
              Change your password while signed in, or email yourself a reset
              link. MFA remains required for the admin portal.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleChangePassword}
          className="space-y-4 p-5 sm:p-6"
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Current password
            </label>
            <input
              type="password"
              className={inputClassName}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={pending}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                New password
              </label>
              <input
                type="password"
                className={inputClassName}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={12}
                disabled={pending}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Confirm new password
              </label>
              <input
                type="password"
                className={inputClassName}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={12}
                disabled={pending}
              />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Use at least 12 characters. You stay signed in after a successful
            change.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              type="submit"
              disabled={pending}
              className="!w-full min-h-11 gap-2 sm:!w-auto"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <KeyRound className="h-4 w-4" aria-hidden />
              )}
              Update password
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={resetPending || pending}
              className="!w-full min-h-11 gap-2 sm:!w-auto"
              onClick={() => setConfirmReset(true)}
            >
              Email reset link
            </Button>
          </div>
        </form>
      </section>

      <ConfirmDialog
        open={confirmReset}
        title="Send password reset email?"
        description="We will email you a secure link to set a new password."
        confirmLabel="Send reset email"
        loading={resetPending}
        onConfirm={sendResetEmail}
        onCancel={() => {
          if (resetPending) return;
          setConfirmReset(false);
        }}
      />
    </>
  );
}
