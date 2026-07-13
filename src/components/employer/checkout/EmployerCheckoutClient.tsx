"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import type { PricingPlan } from "@/types/employer/billing";
import { OrderSummary } from "@/components/employer/checkout/OrderSummary";

interface EmployerCheckoutClientProps {
  plan: PricingPlan;
  checkoutUrl: string;
  /** Immediately send the browser to Stripe (portal confirm flows). */
  autoRedirect?: boolean;
  ctaLabel?: string;
}

export function EmployerCheckoutClient({
  plan,
  checkoutUrl,
  autoRedirect = false,
  ctaLabel = "Continue to Stripe Checkout (USD)",
}: EmployerCheckoutClientProps) {
  useEffect(() => {
    if (!autoRedirect || !checkoutUrl) return;
    window.location.href = checkoutUrl;
  }, [autoRedirect, checkoutUrl]);

  if (autoRedirect) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-100 bg-white p-12 shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-[#006e2f]" aria-hidden />
        <p className="text-sm font-bold text-slate-900">Redirecting to Stripe...</p>
        <p className="text-xs font-medium text-slate-500 text-center max-w-sm">
          Confirm your plan change on Stripe. Your local plan only updates after
          Stripe confirms.
        </p>
        <a
          href={checkoutUrl}
          className="mt-2 text-xs font-bold text-[#006e2f] hover:underline"
        >
          Click here if you are not redirected
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      <OrderSummary
        planName={plan.name}
        planPrice={plan.price}
        features={plan.features}
      />

      <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6 lg:sticky lg:top-28">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Secure checkout</h2>
          <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">
            You&apos;ll complete payment on Stripe. Your plan activates after
            payment — usually within a minute once the webhook processes.
          </p>
        </div>

        <ul className="space-y-2 text-xs font-medium text-slate-600">
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#006e2f]" aria-hidden />
            Billed monthly in USD
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#006e2f]" aria-hidden />
            Cancel anytime from Account Settings
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#006e2f]" aria-hidden />
            Downgrades take effect at the end of your billing period
          </li>
        </ul>

        <a
          href={checkoutUrl}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#006e2f] px-5 py-4 text-sm font-bold text-white transition-colors hover:bg-[#005c26]"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </a>

        <p className="text-center text-[11px] font-medium text-slate-400">
          By continuing, you agree to our{" "}
          <Link
            href="/terms-of-service"
            className="text-[#006e2f] hover:underline"
          >
            Terms of Service
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
