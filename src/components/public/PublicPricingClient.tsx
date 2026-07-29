"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PricingCards } from "@/components/employer/pricing/PricingCards";
import { BillingIntervalToggle } from "@/components/employer/pricing/BillingIntervalToggle";
import { CompareTable } from "@/components/employer/pricing/CompareTable";
import { FAQ } from "@/components/employer/pricing/FAQ";
import type { FAQItem, PricingPlan, TestimonialItem } from "@/types/employer/billing";
import {
  DEFAULT_BILLING_INTERVAL,
  type BillingInterval,
} from "@/lib/pricing/billing-interval";

interface PublicPricingClientProps {
  plans: PricingPlan[];
  testimonials: TestimonialItem[];
  faqs: FAQItem[];
}

export function PublicPricingClient({
  plans,
  faqs,
}: PublicPricingClientProps) {
  const router = useRouter();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(
    DEFAULT_BILLING_INTERVAL
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <BillingIntervalToggle
        value={billingInterval}
        onChange={setBillingInterval}
        className="mb-6"
      />
      <PricingCards
        plans={plans}
        billingInterval={billingInterval}
        onSelectPlan={() => router.push("/signup/employer")}
      />
      <CompareTable plans={plans} />
      <FAQ items={faqs} />
    </>
  );
}
