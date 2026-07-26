"use client";

import { useTransition } from "react";
import Link from "next/link";
import { AlertTriangle, Ban, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logOutToHome } from "@/actions/auth";
import {
  ACCOUNT_LIFECYCLE_TIMELINES,
  APPEAL_SLA_COPY,
  DELETION_REQUEST_SUPPORT_EMAIL,
} from "@/lib/data/legal";

export type AccountRestrictionKind = "suspended" | "closed";

type AccountRestrictionNoticeProps = {
  kind: AccountRestrictionKind;
  hasSession: boolean;
  suspensionEndsAt?: string | null;
};

const SUPPORT_MAILTO = `mailto:${DELETION_REQUEST_SUPPORT_EMAIL}?subject=${encodeURIComponent(
  "Account Appeal"
)}`;

export function AccountRestrictionNotice({
  kind,
  hasSession,
  suspensionEndsAt,
}: AccountRestrictionNoticeProps) {
  const [pending, startTransition] = useTransition();
  const isClosed = kind === "closed";

  const endsLabel =
    !isClosed && suspensionEndsAt
      ? new Date(suspensionEndsAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

  const handleLogout = () => {
    startTransition(async () => {
      await logOutToHome();
    });
  };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#f8fafe] px-4 py-10 sm:px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8">
        <div
          className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${
            isClosed ? "bg-slate-100 text-slate-700" : "bg-amber-50 text-amber-700"
          }`}
          aria-hidden
        >
          {isClosed ? <Ban className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          {isClosed ? "Account Closed" : "Account Suspended"}
        </h1>

        <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
          {isClosed ? (
            <>
              <p>
                This account has been permanently deactivated. Marketplace access, messaging, and
                hiring tools are no longer available.
              </p>
              <p>
                Billing and contract ledgers may be retained for legal and tax compliance (up to{" "}
                {ACCOUNT_LIFECYCLE_TIMELINES.billingRetainYears} years). Under the Philippines Data
                Privacy Act (RA 10173) and applicable privacy laws, you may contact support to appeal
                this decision or request access to retained records you are entitled to receive.
              </p>
            </>
          ) : (
            <>
              <p>
                Your access to Replaceme is temporarily restricted due to a policy review or admin
                action. You cannot use the dashboard, apply to jobs, or message other users while
                this status is active.
              </p>
              {endsLabel ? (
                <p>
                  Current review window ends on{" "}
                  <strong className="font-semibold text-slate-800">{endsLabel}</strong>, unless
                  Trust &amp; Safety updates it sooner.
                </p>
              ) : (
                <p>This restriction remains in place until Trust &amp; Safety completes review.</p>
              )}
              <p>{APPEAL_SLA_COPY}</p>
            </>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <a
            href={SUPPORT_MAILTO}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#006e2f] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#005c26] active:scale-[0.98]"
          >
            <Mail className="h-4 w-4 shrink-0" aria-hidden />
            Contact Support
          </a>

          {hasSession ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full"
              disabled={pending}
              onClick={handleLogout}
            >
              {pending ? "Signing out…" : "Log out"}
            </Button>
          ) : (
            <Link
              href="/"
              className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 active:scale-[0.98]"
            >
              Back to homepage
            </Link>
          )}
        </div>

        <p className="mt-5 text-center text-xs leading-relaxed text-slate-500">
          {isClosed ? (
            <>
              Learn more in{" "}
              <Link href="/help/account/close-delete" className="font-semibold text-[#006e2f] hover:underline">
                Close or delete your account
              </Link>
              .
            </>
          ) : (
            <>
              Learn more in{" "}
              <Link href="/help/account/suspension" className="font-semibold text-[#006e2f] hover:underline">
                Account suspension
              </Link>
              .
            </>
          )}
        </p>
      </div>
    </main>
  );
}
