"use client";

import { useRouter } from "next/navigation";
import { PricingCards } from "@/components/employer/pricing/PricingCards";
import { CompareTable } from "@/components/employer/pricing/CompareTable";
import { FAQ } from "@/components/employer/pricing/FAQ";
import type { FAQItem, PricingPlan, TestimonialItem } from "@/types/employer/billing";

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

  return (
    <>
      <PricingCards plans={plans} onSelectPlan={() => router.push("/signup/employer")} />
      <CompareTable plans={plans} />
      <FAQ items={faqs} />
    </>
  );
}
