"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { requestPasswordResetForCurrentUser } from "@/actions/employer/account";

export function PasswordResetButton() {
  const [pending, startTransition] = useTransition();

  const handleReset = () => {
    startTransition(async () => {
      const toastId = toast.loading("Sending reset link...");
      try {
        const result = await requestPasswordResetForCurrentUser();
        if (result.success) {
          toast.success(
            result.message ??
              "If an account exists for this email, a password reset link has been sent.",
            { id: toastId }
          );
        } else {
          toast.error(result.error ?? "Failed to send reset link.", { id: toastId });
        }
      } catch {
        toast.error("Failed to send reset link. Please try again.", { id: toastId });
      }
    });
  };

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleReset}
      className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-emerald-600 transition-colors hover:text-emerald-700 disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
      Reset password
    </button>
  );
}
