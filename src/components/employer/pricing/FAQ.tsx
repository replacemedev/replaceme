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
    question: "How do Starter, Growth, and Scale compare?",
    answer:
      "Starter ($19/mo) includes 3 jobs and messaging. Growth ($39/mo) provides 10 jobs and priority listings. Scale ($79/mo) unlocks unlimited jobs, unlimited applicants, and priority support.",
  },
  {
    question: "Are there any placement fees or salary commissions?",
    answer:
      "No. You only pay a flat monthly subscription fee. We never charge placement fees, agency markups, or cuts from worker salaries.",
  },
  {
    question: "Can I change or cancel my plan anytime?",
    answer:
      "Yes! You can upgrade, downgrade, or cancel your subscription plan at any time directly from your employer billing dashboard.",
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
    <div className="max-w-4xl mx-auto px-6 py-20">
      {/* Centered Got questions? */}
      <h3 className="text-2xl md:text-3xl font-extrabold text-[#0d1e36] text-center mb-12 tracking-tight">
        Got questions?
      </h3>

      {/* Stacked Cards */}
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="border border-gray-100 rounded-3xl bg-white p-6 md:p-8 shadow-sm flex flex-col space-y-2"
          >
            <h4 className="text-base font-bold text-gray-900 leading-snug">
              {faq.question}
            </h4>
            <p className="text-sm font-semibold text-gray-500 leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
