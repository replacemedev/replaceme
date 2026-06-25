"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { DropdownOption } from "@/lib/validations/employer/company";
import { Link2 } from "lucide-react";

interface CompanyDetailsFormProps {
  industries: DropdownOption[];
}

export function CompanyDetailsForm({ industries }: CompanyDetailsFormProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const companyBio = watch("companyBio") || "";
  const remainingChars = 500 - companyBio.length;

  // Fallback default industries if none provided by server actions
  const defaultIndustries = industries.length > 0 ? industries : [
    { label: "Technology & Software", value: "Technology & Software" },
    { label: "Design & Creative Services", value: "Design & Creative Services" },
    { label: "Marketing & Advertising", value: "Marketing & Advertising" },
    { label: "Customer Support & Operations", value: "Customer Support & Operations" },
    { label: "Finance & Accounting", value: "Finance & Accounting" },
    { label: "E-commerce & Retail", value: "E-commerce & Retail" },
    { label: "Education & E-learning", value: "Education & E-learning" },
    { label: "Healthcare & Life Sciences", value: "Healthcare & Life Sciences" },
  ];

  return (
    <div className="space-y-6">
      {/* Company Name */}
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

      {/* Row 2: Website URL & Industry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Website URL */}
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

        {/* Industry */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Industry <span className="text-red-500">*</span>
          </label>
          <div className="relative pb-5">
            <select
              className={`flex h-12 w-full rounded-xl border ${
                errors.industry ? "border-red-500 focus-visible:ring-red-500" : "border-slate-200 focus-visible:ring-[#22c55e]"
              } bg-white px-4 py-2 text-sm text-slate-800 font-body-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
              {...register("industry")}
            >
              <option value="">Select an industry</option>
              {defaultIndustries.map((ind) => (
                <option key={ind.value} value={ind.value}>
                  {ind.label}
                </option>
              ))}
            </select>
            {errors.industry && (
              <p className="text-red-500 text-xs mt-1 absolute bottom-0 left-0">
                {errors.industry.message as string}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Company Bio */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-semibold text-slate-700">
            Company Bio
          </label>
          <span className={`text-xs font-medium ${remainingChars < 50 ? "text-red-500 font-bold" : "text-slate-400"}`}>
            {remainingChars} characters remaining
          </span>
        </div>
        <div className="relative pb-5">
          <textarea
            rows={5}
            maxLength={500}
            placeholder="Briefly describe what your company does, your mission, and culture..."
            className={`flex w-full rounded-xl border ${
              errors.companyBio ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-[#22c55e]"
            } bg-white px-4 py-3 text-sm text-slate-800 font-body-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 resize-y`}
            {...register("companyBio")}
          />
          {errors.companyBio && (
            <p className="text-red-500 text-xs mt-1 absolute bottom-0 left-0">
              {errors.companyBio.message as string}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
