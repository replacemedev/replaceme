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
      {/* Desktop version: Horizontal stepper */}
      <div className="hidden md:flex items-center justify-between w-full relative py-6 select-none">
        {/* Background connector line (starts at 12.5% and ends at 87.5%) */}
        <div className="absolute top-5 left-[12.5%] right-[12.5%] h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
        
        {/* Active progress connector line (spans 75% total from first node center to last node center) */}
        {activeIndex > 0 && (
          <div
            className="absolute top-5 left-[12.5%] h-0.5 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500 ease-out"
            style={{ width: `${(activeIndex / (steps.length - 1)) * 75}%` }}
          />
        )}

        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;

          return (
            <div key={idx} className="flex flex-col items-center relative z-10 w-1/4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 bg-white ${
                  isCompleted
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/10"
                    : isActive
                    ? "border-emerald-600 text-emerald-600 ring-4 ring-emerald-100/70 shadow-sm"
                    : "border-slate-200 text-slate-400"
                }`}
              >
                {isCompleted ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  <span className="text-xs font-black">{idx + 1}</span>
                )}
              </div>
              <div className="text-center mt-3">
                <p className={`text-xs font-black transition-colors duration-300 ${isActive ? "text-emerald-700" : isCompleted ? "text-slate-800" : "text-slate-400"}`}>
                  {step.label}
                </p>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5 max-w-[120px] mx-auto leading-normal">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile version: Vertical timeline */}
      <div className="flex md:hidden flex-col space-y-6 relative pl-4 select-none">
        {/* Background connector line */}
        <div className="absolute top-4 bottom-4 left-6 w-0.5 bg-slate-100" />
        
        {/* Active connection line */}
        {activeIndex > 0 && (
          <div
            className="absolute left-6 top-4 bg-emerald-500 w-0.5 transition-all duration-500 ease-out"
            style={{
              height: activeIndex === 3 ? "calc(100% - 2rem)" : `${(activeIndex / (steps.length - 1)) * 78}%`,
            }}
          />
        )}

        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;

          return (
            <div key={idx} className="flex items-start relative pl-10 min-h-[40px]">
              <div
                className={`absolute left-2 top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 z-10 transition-all duration-300 bg-white ${
                  isCompleted
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/10"
                    : isActive
                    ? "border-emerald-600 text-emerald-600 ring-4 ring-emerald-100/70 shadow-sm"
                    : "border-slate-200 text-slate-400"
                }`}
              >
                {isCompleted ? (
                  <Check size={12} strokeWidth={3} />
                ) : (
                  <span className="text-xs font-black">{idx + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className={`text-xs font-black transition-colors duration-300 ${isActive ? "text-emerald-700" : isCompleted ? "text-slate-800" : "text-slate-400"}`}>
                  {step.label}
                </p>
                <p className="text-[10px] font-semibold text-slate-400 leading-normal mt-0.5">
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
