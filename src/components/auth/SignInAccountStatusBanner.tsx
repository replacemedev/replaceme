"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import {
  APPEAL_SLA_COPY,
  DELETION_REQUEST_SUPPORT_EMAIL,
} from "@/lib/data/legal";

export type SignInAccountReason = "suspended" | "account_closed";

export function SignInAccountStatusBanner({
  reason,
}: {
  reason: SignInAccountReason | null;
}) {
  if (!reason) return null;

  const isClosed = reason === "account_closed";

  return (
    <div
      role="alert"
      className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      <div className="flex gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
        <div className="space-y-1.5">
          <p className="font-semibold">
            {isClosed ? "This account has been closed" : "This account is suspended"}
          </p>
          <p className="text-amber-900/90 leading-relaxed">
            {isClosed
              ? "Sign-in is disabled. If you believe this was a mistake, contact support. You may create a new account if you want to use Replaceme again."
              : `You cannot access the dashboard while suspended. ${APPEAL_SLA_COPY}`}
          </p>
          <p>
            <a
              href={`mailto:${DELETION_REQUEST_SUPPORT_EMAIL}`}
              className="font-semibold text-[#006e2f] underline underline-offset-2"
            >
              {DELETION_REQUEST_SUPPORT_EMAIL}
            </a>
            {" · "}
            <Link
              href="/help/account/suspension"
              className="font-semibold text-[#006e2f] underline underline-offset-2"
            >
              Learn more
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function parseSignInAccountReason(
  raw: string | undefined
): SignInAccountReason | null {
  if (raw === "suspended" || raw === "account_closed") return raw;
  return null;
}
