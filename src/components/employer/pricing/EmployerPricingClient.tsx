"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { PricingCards } from "@/components/employer/pricing/PricingCards";
import { BillingIntervalToggle } from "@/components/employer/pricing/BillingIntervalToggle";
import { CompareTable } from "@/components/employer/pricing/CompareTable";
import { FAQ } from "@/components/employer/pricing/FAQ";
import { PlanStatusBanner } from "@/components/employer/billing/PlanStatusBanner";
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
  DEFAULT_BILLING_INTERVAL,
  type BillingInterval,
} from "@/lib/pricing/billing-interval";
import {
  isCurrentTier,
  isHigherTier,
  isLowerTier,
  normalizePlanSlug,
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
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(
    DEFAULT_BILLING_INTERVAL
  );

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
      router.push(`/employer/checkout/${target}?interval=${billingInterval}`);
    }
  };

  return (
    <div className="space-y-10">
      <PlanStatusBanner currentPlanSlug={currentPlanSlug} />

      <BillingIntervalToggle
        value={billingInterval}
        onChange={setBillingInterval}
        className="mb-2"
      />

      <PricingCards
        plans={plans}
        currentPlanSlug={currentPlanSlug}
        billingInterval={billingInterval}
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
