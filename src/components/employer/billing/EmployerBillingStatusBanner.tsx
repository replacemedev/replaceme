"use client";

import Link from "next/link";
import { useTransition } from "react";
import { AlertTriangle, CreditCard, Loader2 } from "lucide-react";
import { createCustomerPortalSession } from "@/actions/employer/billing";
import { toast } from "sonner";

type Props = {
  status: string;
  lastPaymentError?: string | null;
};

/**
 * past_due keeps entitlements (grace); unpaid/incomplete are hard-restricted in SQL.
 */
export function EmployerBillingStatusBanner({ status, lastPaymentError }: Props) {
  const [pending, startTransition] = useTransition();
  const normalized = status.toLowerCase().replace(/\s+/g, "_");

  if (
    normalized !== "past_due" &&
    normalized !== "unpaid" &&
    normalized !== "incomplete"
  ) {
    return null;
  }

  const copy =
    normalized === "incomplete"
      ? {
          title: "Payment authentication required",
          body:
            lastPaymentError ||
            "Your card requires 3D Secure confirmation. Finish payment within 23 hours or the subscription expires.",
        }
      : normalized === "past_due"
        ? {
            title: "Payment past due",
            body:
              lastPaymentError ||
              "We could not collect your latest invoice. Update your payment method to keep premium access.",
          }
        : {
            title: "Subscription unpaid",
            body:
              lastPaymentError ||
              "Premium features are restricted until payment succeeds.",
          };

  const openPortal = () => {
    startTransition(async () => {
      const result = await createCustomerPortalSession();
      if (result.success && result.portalUrl) {
        window.location.href = result.portalUrl;
        return;
      }
      toast.error(result.error ?? "Could not open billing portal.");
    });
  };

  return (
    <div
      className="border-b border-amber-200 bg-amber-50 px-4 py-3"
      role="alert"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
            aria-hidden
          />
          <div>
            <p className="text-sm font-semibold text-amber-950">{copy.title}</p>
            <p className="mt-0.5 text-xs text-amber-800/90 leading-relaxed">
              {copy.body}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openPortal}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-900 px-4 py-2 text-xs font-bold text-white hover:bg-amber-800 disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <CreditCard className="h-3.5 w-3.5" aria-hidden />
            )}
            Update payment
          </button>
          <Link
            href="/employer/settings/account#manage-plan"
            className="text-xs font-semibold text-amber-900 underline"
          >
            Manage plan
          </Link>
        </div>
      </div>
    </div>
  );
}
