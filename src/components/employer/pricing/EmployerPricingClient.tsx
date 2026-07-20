"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { PricingCards } from "@/components/employer/pricing/PricingCards";
import { CompareTable } from "@/components/employer/pricing/CompareTable";
import { FAQ } from "@/components/employer/pricing/FAQ";
import type {
  FAQItem,
  PricingPlan,
  SubscriptionTier,
  TestimonialItem,
} from "@/types/employer/billing";
import type { EmployerPlanUsage } from "@/lib/server/entitlements";
import { isActiveJobLimitReached } from "@/lib/entitlements/limits";
import { UnlockOverlay } from "@/components/shared/entitlements/UnlockOverlay";
import {
  isCurrentTier,
  isHigherTier,
  isLowerTier,
  normalizePlanSlug,
  TIER_LABELS,
} from "@/lib/entitlements/ui-copy";

interface EmployerPricingClientProps {
  plans: PricingPlan[];
  testimonials: TestimonialItem[];
  faqs: FAQItem[];
  currentPlanSlug: SubscriptionTier;
  planUsage: EmployerPlanUsage | null;
}

export function EmployerPricingClient({
  plans,
  faqs,
  currentPlanSlug,
  planUsage,
}: EmployerPricingClientProps) {
  const router = useRouter();
  const [jobLimitGateOpen, setJobLimitGateOpen] = useState(false);
  const currentLabel = TIER_LABELS[currentPlanSlug];
  const isPaid = currentPlanSlug !== "discovery";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSelectPlan = (planSlug: string) => {
    const target = normalizePlanSlug(planSlug);

    if (target === "discovery") {
      const atLimit =
        planUsage !== null &&
        isActiveJobLimitReached(
          planUsage.activeJobsCount,
          planUsage.activeJobsLimit
        );

      if (atLimit) {
        setJobLimitGateOpen(true);
        return;
      }

      router.push("/employer/jobs/create");
      return;
    }

    if (isCurrentTier(target, currentPlanSlug)) {
      router.push("/employer/settings/account");
      return;
    }

    if (isLowerTier(target, currentPlanSlug)) {
      router.push("/employer/settings/account");
      return;
    }

    if (isHigherTier(target, currentPlanSlug)) {
      router.push(`/employer/checkout/${target}`);
    }
  };

  return (
    <div className="space-y-10">
      {isPaid ? (
        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-[#006e2f]/20 bg-white px-5 py-4 shadow-sm">
            <div>
              <p className="text-sm font-bold text-slate-900">
                You&apos;re on the {currentLabel} plan
              </p>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Upgrade to unlock more jobs and applicants, or manage billing in
                account settings. Downgrades take effect at the end of your
                billing cycle.
              </p>
            </div>
            <Link
              href="/employer/settings/account"
              className="shrink-0 inline-flex items-center justify-center rounded-xl bg-[#006e2f] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#005c26] transition-colors"
            >
              Account & Billing
            </Link>
          </div>
        </div>
      ) : null}

      <PricingCards
        plans={plans}
        currentPlanSlug={currentPlanSlug}
        onSelectPlan={handleSelectPlan}
      />

      <CompareTable plans={plans} currentPlanSlug={currentPlanSlug} />
      <FAQ items={faqs} />

      {jobLimitGateOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label="Job limit reached"
          onClick={() => setJobLimitGateOpen(false)}
        >
          <div
            className="relative w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setJobLimitGateOpen(false)}
              className="absolute -top-2 -right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-slate-800"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <UnlockOverlay
              feature="job_limit"
              currentPlan={planUsage?.planSlug ?? currentPlanSlug}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
