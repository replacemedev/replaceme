"use client";

import { useRouter } from "next/navigation";
import { PricingCards } from "@/components/employer/pricing/PricingCards";
import { CompareTable } from "@/components/employer/pricing/CompareTable";
import { FAQ } from "@/components/employer/pricing/FAQ";
import { Testimonials } from "@/components/employer/pricing/Testimonials";
import type { FAQItem, PricingPlan, TestimonialItem } from "@/types/employer/billing";

interface PublicPricingClientProps {
  plans: PricingPlan[];
  testimonials: TestimonialItem[];
  faqs: FAQItem[];
}

export function PublicPricingClient({
  plans,
  testimonials,
  faqs,
}: PublicPricingClientProps) {
  const router = useRouter();

  return (
    <>
      <PricingCards plans={plans} onSelectPlan={() => router.push("/signup")} />
      <CompareTable plans={plans} />
      <Testimonials items={testimonials} />
      <FAQ items={faqs} />
    </>
  );
}
