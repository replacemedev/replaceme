"use client";

import React from "react";
import { Check } from "lucide-react";
import { ApplicationStatus } from "@/types/applications";

interface ApplicationStepperProps {
  status: ApplicationStatus;
}

export function ApplicationStepper({ status }: ApplicationStepperProps) {
  // Determine current active step index
  let activeIndex = 0;
  if (status === "PENDING") activeIndex = 0;
  else if (status === "UNDER_REVIEW") activeIndex = 1;
  else if (status === "INTERVIEW_SCHEDULED") activeIndex = 2;
  else if (status === "HIRED" || status === "REJECTED") activeIndex = 3;
  else if (status === "WITHDRAWN") activeIndex = -1; // special withdrawn case

  const steps = [
    { label: "Applied", desc: "Application submitted" },
    { label: "Shortlisted", desc: "Under employer review" },
    { label: "Interview", desc: "Interview scheduling" },
    {
      label: status === "HIRED" ? "Hired" : status === "REJECTED" ? "Decision" : "Decision",
      desc: status === "HIRED" ? "Offer accepted!" : status === "REJECTED" ? "Declined" : "Final decision",
    },
  ];

  return (
    <div className="w-full">
      {/* Responsive layout: Horizontally scrollable on mobile to prevent squishing, full width row on desktop */}
      <div className="flex flex-row overflow-x-auto md:overflow-x-visible snap-x snap-mandatory gap-4 md:gap-0 justify-start md:justify-between w-full py-4 select-none scrollbar-none">
        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;
          const isPending = idx > activeIndex;

          return (
            <div
              key={idx}
              className="flex flex-col items-center shrink-0 md:shrink md:w-1/4 w-[160px] snap-center px-2"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 bg-white ${
                  isCompleted
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/10"
                    : isActive
                    ? "bg-white border-emerald-500 border-4 text-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    : "bg-white border-slate-200 text-slate-350"
                }`}
              >
                {isCompleted ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  <span className="text-xs font-black">{idx + 1}</span>
                )}
              </div>
              <div className="text-center mt-3">
                <p
                  className={`text-xs transition-colors duration-300 ${
                    isActive
                      ? "text-gray-900 font-bold"
                      : isCompleted
                      ? "text-slate-800 font-bold"
                      : "text-slate-400 font-semibold"
                  }`}
                >
                  {step.label}
                </p>
                <p
                  className={`text-[10px] font-semibold mt-0.5 max-w-[120px] mx-auto leading-normal transition-colors duration-300 ${
                    isActive || isCompleted ? "text-gray-500" : "text-slate-400"
                  }`}
                >
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
