"use client";

import React from "react";
import { Check } from "lucide-react";
import { PricingPlan } from "@/types/employer/billing";

interface PricingCardsProps {
  plans: PricingPlan[];
  onSelectPlan: (planName: string) => void;
}

export function PricingCards({ plans, onSelectPlan }: PricingCardsProps) {
  if (!plans || plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
        <p className="text-gray-500 font-medium text-lg">No pricing plans available at the moment.</p>
        <p className="text-gray-400 text-sm mt-1">Please check back later or contact support.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 py-8">
      {plans.map((plan) => {
        const isEssential = plan.name.toLowerCase() === "essential";
        const isProfessional = plan.name.toLowerCase() === "professional";

        return (
          <div
            key={plan.id}
            className={`relative flex flex-col justify-between p-8 rounded-2xl bg-white transition-all duration-300 ${
              isEssential
                ? "border-2 border-[#10b981] shadow-lg md:-translate-y-4 scale-105"
                : "border border-gray-200 shadow-sm hover:shadow-md"
            }`}
          >
            {isEssential && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#e6fbf2] border border-[#10b981] text-[#10b981] text-[10px] uppercase font-bold tracking-wider px-3.5 py-1 rounded-full flex items-center gap-1">
                ★ Most Popular
              </div>
            )}

            <div>
              <h3 className="text-xl font-bold text-gray-900 capitalize">
                {plan.name}
                {plan.name.toLowerCase() === "discovery" && (
                  <span className="text-sm font-normal text-gray-500 ml-1.5">(Free Trial)</span>
                )}
              </h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
                <span className="text-gray-500 font-medium ml-1">/mo</span>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#e6fbf2] flex items-center justify-center mt-0.5">
                      <Check className="w-3.5 h-3.5 text-[#10b981] stroke-[3]" />
                    </div>
                    <span className="text-gray-600 text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <button
                onClick={() => onSelectPlan(plan.name.toLowerCase())}
                className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
                  isEssential
                    ? "bg-[#10b981] text-white hover:bg-[#0d9668] shadow-sm hover:shadow"
                    : isProfessional
                    ? "bg-white border border-[#10b981] text-[#10b981] hover:bg-[#e6fbf2]"
                    : "bg-[#e8edfb] text-[#5569ff] hover:bg-[#d8e0fa]"
                }`}
              >
                {plan.ctaText}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
