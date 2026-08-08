"use client";

import React from "react";
import type { FAQItem } from "@/types/employer/billing";

const fallbackFaqs: FAQItem[] = [
  {
    question: "What is included in the free Discovery plan?",
    answer:
      "Discovery ($0/mo) includes 1 active job post, up to 10 applicants per job, 2-day job approval, and anonymous candidate previews. Upgrading to a paid plan unlocks direct messaging and full candidate profiles.",
  },
  {
    question: "How do monthly and annual billing work?",
    answer:
      "Both options show a monthly price. Monthly plans are charged every month ($19 / $39 / $79). Annual plans are prepaid once per year at a discount (shown as $13 / $26 / $52 per month; billed as $156 / $312 / $624 per year). Pricing defaults to Annual. You can switch to Monthly on the pricing page before checkout.",
  },
  {
    question: "How do Starter, Growth, and Scale compare?",
    answer:
      "Starter includes 3 jobs and messaging. Growth provides 10 jobs and priority listings. Scale unlocks unlimited jobs, unlimited applicants, and priority support. See Annual vs Monthly prices on the pricing cards.",
  },
  {
    question: "Are there any placement fees or salary commissions?",
    answer:
      "No. You only pay a flat subscription fee. We never charge placement fees, agency markups, or cuts from worker salaries.",
  },
  {
    question: "Can I change or cancel my plan anytime?",
    answer:
      "Yes. Upgrade, downgrade, or cancel anytime from Account Settings (online via Stripe Customer Portal). Upgrades apply immediately; downgrades and cancellations take effect at the end of your paid billing period. You keep paid access until then. Annual prepaid periods run for 12 months.",
  },
  {
    question: "Are list prices inclusive of tax?",
    answer:
      "No. Plan prices are shown in USD tax-exclusive. Stripe Tax may add Australian GST or other destination tax at checkout only when required for your billing location. Most overseas employers often see $0 AU GST. Tax goes to the government, not to Stripe as a fee.",
  },
  {
    question: "What is your refund policy?",
    answer:
      "Commenced B2B plan periods (monthly or annual prepaid) are generally non-refundable, except for billing errors, mandatory law, or limited goodwill when access fails due to a Platform fault. See the Refund Policy linked in the site footer.",
  },
  {
    question: "Do job seekers have to pay to use the platform?",
    answer:
      "No, Replaceme is 100% free for job seekers. Workers can create a profile, browse roles, apply, and get paid with zero fees.",
  },
];

export function FAQ(props: { items?: FAQItem[] }) {
  const faqs = props.items === undefined ? fallbackFaqs : fallbackFaqs;

  if (faqs.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* Centered Got questions? */}
      <h3 className="text-2xl md:text-3xl font-extrabold text-[#0d1e36] text-center mb-12 tracking-tight">
        Got questions?
      </h3>

      {/* Stacked Cards */}
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="border border-slate-200 rounded-3xl bg-white p-6 md:p-8 shadow-sm flex flex-col space-y-2"
          >
            <h4 className="text-base font-bold text-slate-900 leading-snug">
              {faq.question}
            </h4>
            <p className="text-sm font-semibold text-slate-500 leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
