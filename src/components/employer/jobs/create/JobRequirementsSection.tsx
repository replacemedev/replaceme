"use client";

import React, { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { DropdownOption } from "@/lib/validations/employer/jobs";
import { DollarSign, Clock, Plus, X } from "lucide-react";

interface JobRequirementsSectionProps {
  skillsOptions: DropdownOption[];
}

export function JobRequirementsSection({ skillsOptions }: JobRequirementsSectionProps) {
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const selectedSkills: string[] = watch("skills") || [];

  // Fallback default skills if none provided by server actions
  const defaultSkills = skillsOptions.length > 0 ? skillsOptions : [
    { label: "React", value: "React" },
    { label: "Next.js", value: "Next.js" },
    { label: "TypeScript", value: "TypeScript" },
    { label: "Tailwind CSS", value: "Tailwind CSS" },
    { label: "Node.js", value: "Node.js" },
    { label: "Python", value: "Python" },
    { label: "UI/UX Design", value: "UI/UX Design" },
    { label: "DevOps", value: "DevOps" },
    { label: "Product Management", value: "Product Management" },
  ];

  // Suggest a market-rate salary
  const handleSuggestSalary = () => {
    // Generate a random suggestion between 4000 and 12000 in increments of 500
    const values = [4000, 5000, 6000, 7500, 8000, 9500, 10000, 12000];
    const randomVal = values[Math.floor(Math.random() * values.length)];
    setValue("monthlySalary", randomVal, { shouldValidate: true });
  };

  const handleToggleSkill = (skillValue: string) => {
    if (selectedSkills.includes(skillValue)) {
      // Remove
      const filtered = selectedSkills.filter((s) => s !== skillValue);
      setValue("skills", filtered, { shouldValidate: true });
    } else {
      // Add if under max limit of 3
      if (selectedSkills.length < 3) {
        setValue("skills", [...selectedSkills, skillValue], { shouldValidate: true });
      }
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">2. Requirements & Compensation</h2>
        <p className="text-sm text-slate-500">Define the compensation details and required skillset.</p>
      </div>

      {/* Salary & Suggestion */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Monthly Salary (USD) <span className="text-red-500">*</span>
          </label>
          <div className="relative pb-5">
            <Input
              type="number"
              placeholder="5000"
              icon={<DollarSign size={18} />}
              error={errors.monthlySalary?.message as string}
              {...register("monthlySalary", { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="pb-5">
          <button
            type="button"
            onClick={handleSuggestSalary}
            className="h-12 w-full px-4 rounded-xl border border-dashed border-slate-200 text-slate-600 hover:text-[#22c55e] hover:border-[#22c55e] hover:bg-emerald-50/10 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
          >
            <DollarSign size={16} />
            Suggest Competitive Salary
          </button>
        </div>
      </div>

      {/* Hours Per Week */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          Hours per Week <span className="text-red-500">*</span>
        </label>
        <div className="relative pb-5">
          <Input
            type="number"
            placeholder="40"
            icon={<Clock size={18} />}
            error={errors.hoursPerWeek?.message as string}
            {...register("hoursPerWeek", { valueAsNumber: true })}
          />
        </div>
      </div>

      {/* Skills Selector */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-semibold text-slate-700">
            Key Required Skills <span className="text-red-500">*</span>
            <span className="text-xs font-normal text-slate-400 ml-1.5">(Select up to 3)</span>
          </label>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {selectedSkills.length}/3 selected
          </span>
        </div>

        {/* Selected Tags list */}
        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 min-h-[50px] items-center">
            {selectedSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold shadow-sm animate-scaleIn"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleToggleSkill(skill)}
                  className="hover:bg-emerald-100 p-0.5 rounded-full text-emerald-600 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* List of skills selector buttons */}
        <div className="relative pb-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {defaultSkills.map((skill) => {
              const isSelected = selectedSkills.includes(skill.value);
              const isDisabled = !isSelected && selectedSkills.length >= 3;
              return (
                <button
                  key={skill.value}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleToggleSkill(skill.value)}
                  className={`flex items-center justify-between px-3 h-10 rounded-xl border text-xs font-medium transition-all duration-200 ${
                    isSelected
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/10"
                  } ${isDisabled ? "opacity-40 cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400" : ""}`}
                >
                  <span>{skill.label}</span>
                  {isSelected ? <X size={12} /> : <Plus size={12} className="text-slate-400" />}
                </button>
              );
            })}
          </div>
          <Controller
            name="skills"
            control={control}
            render={({ field }) => (
              <input type="hidden" value={JSON.stringify(field.value || [])} />
            )}
          />
          {errors.skills && (
            <p className="text-red-500 text-xs mt-1.5 absolute bottom-0 left-0">
              {errors.skills.message as string}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
