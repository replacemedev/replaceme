"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MailWarning, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { resendEmailVerification } from "@/actions/auth";

type EmailVerificationBannerProps = {
  email: string | null;
  needsVerification: boolean;
};

export function EmailVerificationBanner({
  email,
  needsVerification,
}: EmailVerificationBannerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dismissed, setDismissed] = useState(false);

  if (!needsVerification || dismissed) return null;

  function handleVerify() {
    startTransition(async () => {
      const toastId = toast.loading("Sending verification email…");
      const result = await resendEmailVerification();
      if (!result.success) {
        toast.error(result.error ?? "Could not send verification email.", {
          id: toastId,
        });
        return;
      }
      toast.success(result.message ?? "Verification email sent.", {
        id: toastId,
      });
      if (result.message?.toLowerCase().includes("already verified")) {
        setDismissed(true);
        router.refresh();
      }
    });
  }

  return (
    <section
      className="w-full rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:p-5"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
            <MailWarning className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 space-y-1">
            <h2 className="text-sm font-bold text-amber-950 sm:text-base">
              Verify your email
            </h2>
            <p className="text-sm leading-relaxed text-amber-900/90">
              {email ? (
                <>
                  Confirm{" "}
                  <span className="font-semibold break-all">{email}</span>{" "}
                  when you can. Use Verify email to send a confirmation link.
                  You can keep using your account in the meantime.
                </>
              ) : (
                <>
                  Confirm your email when you can — use Verify email to send a
                  confirmation link. You can keep using your account in the
                  meantime.
                </>
              )}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleVerify}
          disabled={pending}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#006e2f] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#005c26] disabled:opacity-60 sm:w-auto sm:self-center"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Sending…
            </>
          ) : (
            "Verify email"
          )}
        </button>
      </div>
    </section>
  );
}
