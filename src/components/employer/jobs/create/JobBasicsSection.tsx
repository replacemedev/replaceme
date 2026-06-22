"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { DropdownOption } from "@/schemas/employer/jobs";

interface JobBasicsSectionProps {
  employmentTypes: DropdownOption[];
}

export function JobBasicsSection({ employmentTypes }: JobBasicsSectionProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  // Fallback default employment types if none provided by server actions
  const defaultTypes = employmentTypes.length > 0 ? employmentTypes : [
    { label: "Full-time", value: "Full-time" },
    { label: "Part-time", value: "Part-time" },
    { label: "Contract", value: "Contract" },
    { label: "Internship", value: "Internship" },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">1. Job Basics</h2>
        <p className="text-sm text-slate-500">Provide the core details of your open position.</p>
      </div>

      {/* Job Title */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          Job Title <span className="text-red-500">*</span>
        </label>
        <div className="relative pb-5">
          <Input
            type="text"
            placeholder="e.g. Senior Full-Stack Engineer (React / Node)"
            error={errors.title?.message as string}
            {...register("title")}
          />
        </div>
      </div>

      {/* Employment Type */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          Employment Type <span className="text-red-500">*</span>
        </label>
        <div className="relative pb-5">
          <select
            className={`flex h-12 w-full rounded-xl border ${
              errors.employmentType ? "border-red-500 focus-visible:ring-red-500" : "border-slate-200 focus-visible:ring-[#22c55e]"
            } bg-white px-4 py-2 text-sm text-slate-800 font-body-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
            {...register("employmentType")}
          >
            <option value="">Select employment type...</option>
            {defaultTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.employmentType && (
            <p className="text-red-500 text-xs mt-1 absolute bottom-0 left-0">
              {errors.employmentType.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Job Description */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          Job Description <span className="text-red-500">*</span>
        </label>
        <div className="relative pb-5">
          <textarea
            rows={6}
            placeholder="Describe the responsibilities, expectations, and day-to-day for this role..."
            className={`flex w-full rounded-xl border ${
              errors.description ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-[#22c55e]"
            } bg-white px-4 py-3 text-sm text-slate-800 font-body-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 resize-y`}
            {...register("description")}
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1 absolute bottom-0 left-0">
              {errors.description.message as string}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
