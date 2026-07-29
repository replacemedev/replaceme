"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { DropdownOption } from "@/lib/validations/employer/company";
import { EMPLOYER_INDUSTRIES, HIRING_REGIONS } from "@/lib/data/industries";
import { Link2 } from "lucide-react";

interface CompanyDetailsFormProps {
  industries: DropdownOption[];
}

export function CompanyDetailsForm({ industries }: CompanyDetailsFormProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const companyBio = watch("companyBio") || "";
  const remainingChars = 500 - companyBio.length;
  const selectedRegions: string[] = watch("hiringRegions") || [];

  const industryOptions =
    industries.length > 0 ? industries : [...EMPLOYER_INDUSTRIES];

  const toggleRegion = (value: string) => {
    const next = selectedRegions.includes(value)
      ? selectedRegions.filter((r) => r !== value)
      : [...selectedRegions, value];
    setValue("hiringRegions", next, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          Company Name <span className="text-red-500">*</span>
        </label>
        <div className="relative pb-5">
          <Input
            type="text"
            placeholder="e.g. Acme Corp"
            error={errors.companyName?.message as string}
            {...register("companyName")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Website URL
          </label>
          <div className="relative pb-5">
            <Input
              type="text"
              placeholder="https://www.example.com"
              icon={<Link2 size={18} />}
              error={errors.websiteUrl?.message as string}
              {...register("websiteUrl")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Industry <span className="text-red-500">*</span>
          </label>
          <div className="relative pb-5">
            <select
              className={`flex h-12 w-full min-w-0 rounded-xl border ${
                errors.industry
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "border-slate-200 focus-visible:ring-[#22c55e]"
              } bg-white px-4 py-2 text-base text-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm`}
              {...register("industry")}
            >
              <option value="">Select an industry</option>
              {industryOptions.map((ind) => (
                <option key={ind.value} value={ind.value}>
                  {ind.label}
                </option>
              ))}
            </select>
            {errors.industry && (
              <p className="absolute bottom-0 left-0 text-xs text-red-500">
                {errors.industry.message as string}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          Hiring regions
        </label>
        <p className="text-xs leading-relaxed text-slate-500">
          Where you typically hire remote talent. It helps workers understand fit.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {HIRING_REGIONS.map((region) => {
            const active = selectedRegions.includes(region.value);
            return (
              <button
                key={region.value}
                type="button"
                onClick={() => toggleRegion(region.value)}
                aria-pressed={active}
                className={`min-h-11 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "border-emerald-300 bg-[#ebfdf2] text-[#006e2f]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {region.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label className="block text-sm font-semibold text-slate-700">
            Company Bio
          </label>
          <span
            className={`shrink-0 text-xs font-medium ${
              remainingChars < 50 ? "font-bold text-red-500" : "text-slate-400"
            }`}
          >
            {remainingChars} characters remaining
          </span>
        </div>
        <div className="relative pb-5">
          <textarea
            rows={5}
            maxLength={500}
            placeholder="Briefly describe what your company does, your mission, and culture..."
            className={`flex w-full min-w-0 rounded-xl border ${
              errors.companyBio
                ? "border-red-500 focus:ring-red-500"
                : "border-slate-200 focus:ring-[#22c55e]"
            } bg-white px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 resize-y sm:text-sm`}
            {...register("companyBio")}
          />
          {errors.companyBio && (
            <p className="absolute bottom-0 left-0 text-xs text-red-500">
              {errors.companyBio.message as string}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
