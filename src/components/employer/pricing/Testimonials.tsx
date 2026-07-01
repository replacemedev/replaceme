"use client";

import React from "react";
import type { TestimonialItem } from "@/types/employer/billing";
import { EMPLOYER_CARD } from "@/lib/employer/ui-tokens";

interface TestimonialsProps {
  items?: TestimonialItem[];
}

export function Testimonials({ items }: TestimonialsProps) {
  if (!items?.length) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 bg-[#f8fafe]">
      <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 text-center mb-16 tracking-tight">
        Trusted by Forward-Thinking Employers
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`flex flex-col justify-between p-8 ${EMPLOYER_CARD} relative hover:shadow-md transition-all duration-300`}
          >
            <div className="text-5xl text-[#006e2f]/10 font-serif absolute top-4 left-6 select-none pointer-events-none">
              “
            </div>

            <div className="relative z-10 pt-4">
              <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                &ldquo;{item.quote}&rdquo;
              </p>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{item.author}</h4>
                <p className="text-[11px] font-bold text-slate-400">
                  {item.role}, {item.company}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
