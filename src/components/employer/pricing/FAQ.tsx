"use client";

import React from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Can I change plans later?",
    answer: "Yes! You can upgrade or downgrade your plan at any time from your account settings. Prorated charges or credits will automatically be applied to your account.",
  },
  {
    question: "What happens to my data if I downgrade?",
    answer: "If you downgrade from Professional or Essential to Discovery, your existing job posts beyond the 1 active limit will be paused, but you will not lose your applicant history or messages.",
  },
  {
    question: "Are there any hidden fees per hire?",
    answer: "No. We charge a flat monthly subscription fee for access to the platform based on your tier. You negotiate and pay salaries directly to your hires with zero platform markup.",
  },
];

export function FAQ() {
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

      {/* View all FAQs Outline Button */}
      <div className="text-center mt-10">
        <button className="py-3 px-8 rounded-xl border border-[#10b981] text-[#10b981] font-bold text-sm hover:bg-[#e6fbf2] transition-all cursor-pointer">
          View all FAQs
        </button>
      </div>
    </div>
  );
}
