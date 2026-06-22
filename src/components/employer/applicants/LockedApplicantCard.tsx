"use client";

import React from "react";
import { Lock } from "lucide-react";
import { Applicant } from "@/types/employer/applicants";

interface LockedApplicantCardProps {
  applicant: Applicant;
  onUnlock: () => void;
  disabled?: boolean;
}

export function LockedApplicantCard({
  applicant,
  onUnlock,
  disabled = false,
}: LockedApplicantCardProps) {
  const handleUnlock = () => {
    if (disabled) return;
    onUnlock();
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:shadow-sm">
      {/* Left & Middle block */}
      <div className="flex items-center gap-5 w-full md:w-auto">
        {/* Blurred Avatar with Lock Icon inside */}
        <div className="relative w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
          {/* Simulated blurred avatar */}
          <div className="absolute inset-0 bg-gradient-to-tr from-gray-300 to-gray-200 filter blur-xs" />
          {/* Centered Lock Icon */}
          <div className="relative z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-gray-500 shadow-xs border border-gray-100">
            <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </div>

        {/* Info Area */}
        <div className="space-y-2">
          <h3 className="text-lg font-extrabold text-gray-900 leading-none">{applicant.name}</h3>
          
          <div className="flex flex-wrap gap-2 pt-0.5">
            <span className="px-3 py-1 bg-[#f0f3ff] text-[#5569ff] text-xs font-bold rounded-lg">
              {applicant.experienceYears} Years Experience
            </span>
            <span className="px-3 py-1 bg-[#e6fbf2] text-[#10b981] text-xs font-bold rounded-lg">
              Requested Salary: ${applicant.matchScore ? applicant.matchScore * 10 : 500}/month
            </span>
          </div>
        </div>
      </div>

      {/* Right block: Unlock Button */}
      <button
        onClick={handleUnlock}
        disabled={disabled}
        className="w-full md:w-auto px-6 py-3 bg-[#10b981] hover:bg-[#0d9668] disabled:bg-[#10b981]/70 text-white font-bold text-xs rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:cursor-not-allowed shrink-0"
      >
        <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
        Unlock Profile & Resume
      </button>
    </div>
  );
}

