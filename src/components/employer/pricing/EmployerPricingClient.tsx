"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { PricingCards } from "@/components/employer/pricing/PricingCards";
import { CompareTable } from "@/components/employer/pricing/CompareTable";
import { Testimonials } from "@/components/employer/pricing/Testimonials";
import { FAQ } from "@/components/employer/pricing/FAQ";
import type {
  FAQItem,
  PricingPlan,
  SubscriptionTier,
  TestimonialItem,
} from "@/types/employer/billing";
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
}

export function EmployerPricingClient({
  plans,
  testimonials,
  faqs,
  currentPlanSlug,
}: EmployerPricingClientProps) {
  const router = useRouter();
  const currentLabel = TIER_LABELS[currentPlanSlug];
  const isPaid = currentPlanSlug !== "discovery";

  const handleSelectPlan = (planSlug: string) => {
    const target = normalizePlanSlug(planSlug);

    if (target === "discovery") {
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
      <Testimonials items={testimonials} />
      <FAQ items={faqs} />
    </div>
  );
}
