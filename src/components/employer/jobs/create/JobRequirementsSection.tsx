"use client";

import React, { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { DropdownOption } from "@/lib/validations/employer/jobs";
import { COMPENSATION_CURRENCIES } from "@/lib/format/currency";
import { ONBOARDING_SELECT_CLASS } from "@/config/onboarding";
import { Clock, Plus, X } from "lucide-react";

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
  const [customSkillInput, setCustomSkillInput] = useState("");

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

  const hourlyRateValue = watch("hourlyRate");
  const hoursPerWeekValue = watch("hoursPerWeek");

  React.useEffect(() => {
    const hr = Number(hourlyRateValue) || 0;
    const hpw = Number(hoursPerWeekValue) || 0;
    const calculated = Math.round(hr * hpw * 4);
    setValue("monthlySalary", calculated, { shouldValidate: true });
  }, [hourlyRateValue, hoursPerWeekValue, setValue]);

  const handleSuggestSalary = () => {
    const values = [25, 30, 35, 40, 45, 50, 60, 75];
    const randomVal = values[Math.floor(Math.random() * values.length)];
    setValue("hourlyRate", randomVal, { shouldValidate: true });
  };

  const handleToggleSkill = (skillValue: string) => {
    if (selectedSkills.includes(skillValue)) {
      setValue("skills", selectedSkills.filter((s) => s !== skillValue), { shouldValidate: true });
    } else {
      if (selectedSkills.length < 3) {
        setValue("skills", [...selectedSkills, skillValue], { shouldValidate: true });
      }
    }
  };

  const handleCustomSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    if (selectedSkills.length >= 3) return;
    // Case-insensitive duplicate check
    if (selectedSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return;

    setValue("skills", [...selectedSkills, trimmed], { shouldValidate: true });
    setCustomSkillInput("");
  };

  const isAtLimit = selectedSkills.length >= 3;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">2. Requirements &amp; Compensation</h2>
        <p className="text-sm text-slate-500">Define the compensation details and required skillset.</p>
      </div>

      {/* Currency, Hourly Salary, and Hours */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Salary currency <span className="text-red-500">*</span>
          </label>
          <div className="relative pb-5">
            <select className={ONBOARDING_SELECT_CLASS} {...register("salaryCurrency")}>
              {COMPENSATION_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Hourly salary ($/hr) <span className="text-red-500">*</span>
          </label>
          <div className="relative pb-5">
            <Input
              type="number"
              placeholder="30"
              error={errors.hourlyRate?.message as string}
              {...register("hourlyRate", { valueAsNumber: true })}
            />
          </div>
        </div>

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
      </div>

      {/* Monthly salary (read-only/disabled) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Monthly salary (Calculated)
          </label>
          <div className="relative pb-5">
            <Input
              type="number"
              placeholder="4800"
              readOnly
              className="bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200"
              error={errors.monthlySalary?.message as string}
              {...register("monthlySalary", { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="flex items-end pb-7">
          <button
            type="button"
            onClick={handleSuggestSalary}
            className="h-12 w-full px-4 rounded-xl border border-dashed border-slate-200 text-slate-600 hover:text-[#22c55e] hover:border-[#22c55e] hover:bg-emerald-50/10 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
          >
            Suggest competitive hourly rate
          </button>
        </div>
      </div>

      {/* ── Skills Selector ── */}
      <div className="space-y-3">

        {/* Header: responsive flex-wrap keeps badge on the right */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <label className="block text-sm font-semibold text-slate-700">
              Key Required Skills <span className="text-red-500">*</span>
            </label>
            <span className="text-xs font-normal text-slate-400 whitespace-nowrap">
              (Select up to 3)
            </span>
          </div>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 transition-colors ${
              isAtLimit
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {selectedSkills.length}/3 selected
          </span>
        </div>

        {/* Custom skill input */}
        <div className="relative">
          <input
            type="text"
            value={customSkillInput}
            onChange={(e) => setCustomSkillInput(e.target.value)}
            onKeyDown={handleCustomSkillKeyDown}
            disabled={isAtLimit}
            placeholder={
              isAtLimit
                ? "3 skills selected — remove one to add more"
                : "Type a custom skill and press Enter…"
            }
            className={`w-full h-10 rounded-xl border px-3 pr-16 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 ${
              isAtLimit
                ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed placeholder:text-slate-400"
                : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
            }`}
          />
          {customSkillInput.trim() && !isAtLimit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none select-none">
              ↵ Enter
            </span>
          )}
        </div>

        {/* Selected tags */}
        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 min-h-[50px] items-center">
            {selectedSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold shadow-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleToggleSkill(skill)}
                  className="hover:bg-emerald-100 p-0.5 rounded-full text-emerald-600 transition-colors cursor-pointer"
                  aria-label={`Remove ${skill}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Predefined pills grid */}
        <div className="relative pb-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {defaultSkills.map((skill) => {
              const isSelected = selectedSkills.includes(skill.value);
              const isDisabled = !isSelected && isAtLimit;
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
