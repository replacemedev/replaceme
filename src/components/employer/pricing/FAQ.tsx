"use client";

import React from "react";
import type { FAQItem } from "@/types/employer/billing";

const fallbackFaqs: FAQItem[] = [
  {
    question: "What is included in the free Discovery plan?",
    answer:
      "Discovery ($0/mo) includes 1 active job post, up to 10 applicants per job, 2-day job approval, and anonymous candidate previews. Messaging and resume downloads require a paid tier.",
  },
  {
    question: "How do Starter, Growth, and Scale compare?",
    answer:
      "Starter ($19/mo) offers 3 jobs, full profiles, and messaging. Growth ($39/mo) provides 10 jobs and priority listing. Scale ($79/mo) unlocks unlimited jobs and priority support.",
  },
  {
    question: "Are there any hidden placement fees or commissions?",
    answer:
      "Absolutely not. You only pay your flat monthly subscription fee. We do not charge agency markups or commissions when you successfully hire a candidate.",
  },
  {
    question: "Can I change or cancel my subscription tier?",
    answer:
      "Yes. Employers have full control over their billing. You can upgrade, downgrade, or cancel your plan at any time directly from your Employer dashboard.",
  },
  {
    question: "Do job seekers have to pay to use the platform?",
    answer:
      "No, the platform is 100% free for job seekers. Our pricing tiers apply exclusively to employers looking to access our talent pool and post jobs.",
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
