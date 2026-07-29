"use client";

import React from "react";
import { Check } from "lucide-react";
import { ApplicationStatus } from "@/types/applications";

interface ApplicationStepperProps {
  status: ApplicationStatus;
}

export function ApplicationStepper({ status }: ApplicationStepperProps) {
  let activeIndex = 0;
  if (status === "PENDING") activeIndex = 0;
  else if (status === "UNDER_REVIEW") activeIndex = 1;
  else if (status === "HIRED" || status === "REJECTED") activeIndex = 2;
  else if (status === "WITHDRAWN") activeIndex = -1;

  const steps = [
    { label: "Applied", desc: "Application submitted" },
    { label: "Shortlisted", desc: "Under employer review" },
    {
      label: status === "HIRED" ? "Hired" : "Decision",
      desc:
        status === "HIRED"
          ? "Offer accepted!"
          : status === "REJECTED"
            ? "Declined"
            : "Final decision",
    },
  ];

  return (
    <div className="w-full">
      <div className="flex w-full flex-row justify-start gap-0 overflow-x-auto overscroll-x-contain py-4 [-webkit-overflow-scrolling:touch] select-none snap-x snap-mandatory scrollbar-none px-1 md:justify-between md:overflow-x-visible md:px-0">
        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;
          const isLast = idx === steps.length - 1;

          const circleClass = isCompleted
            ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20"
            : isActive
              ? "bg-white border-emerald-500 border-[3px] text-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
              : "bg-white border-slate-200 text-slate-300";

          return (
            <div
              key={idx}
              className="flex flex-col items-center shrink-0 md:shrink md:flex-1 w-[140px] snap-center relative"
            >
              {!isLast && (
                <div
                  className={`hidden md:block absolute top-5 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-[2px] transition-colors duration-300 ${
                    isCompleted ? "bg-emerald-400" : "bg-slate-200"
                  }`}
                />
              )}

              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${circleClass}`}
              >
                {isCompleted ? (
                  <Check size={16} strokeWidth={3} className="text-white" />
                ) : (
                  <span
                    className={`text-xs font-black ${
                      isActive ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {idx + 1}
                  </span>
                )}
              </div>

              <div className="text-center mt-3 px-1">
                <p
                  className={`text-xs leading-tight transition-colors duration-300 ${
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
                  className={`text-[10px] font-semibold mt-0.5 max-w-[110px] mx-auto leading-normal transition-colors duration-300 ${
                    isActive || isCompleted ? "text-gray-500" : "text-slate-300"
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
