"use client";

import React, { useTransition } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { SkillSelectDropdown } from "@/components/shared/SkillSelectDropdown";
import { COMPENSATION_CURRENCIES } from "@/lib/format/currency";
import { ONBOARDING_SELECT_CLASS } from "@/config/onboarding";
import { Clock, Sparkles } from "lucide-react";
import { suggestCompetitiveHourlyRate } from "@/actions/employer/jobs";
import { toast } from "sonner";

export function JobRequirementsSection() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const selectedSkills: string[] = watch("skills") || [];
  const jobTitle: string = watch("title") || "";
  const salaryCurrency = watch("salaryCurrency") || "PHP";
  const hourlyRateValue = watch("hourlyRate");
  const hoursPerWeekValue = watch("hoursPerWeek");
  const [isSuggesting, startSuggest] = useTransition();

  React.useEffect(() => {
    const hr = Number(hourlyRateValue) || 0;
    const hpw = Number(hoursPerWeekValue) || 0;
    const calculated = Math.round(hr * hpw * 4);
    setValue("monthlySalary", calculated, { shouldValidate: true });
  }, [hourlyRateValue, hoursPerWeekValue, setValue]);

  const handleSuggestSalary = () => {
    startSuggest(async () => {
      const result = await suggestCompetitiveHourlyRate({
        title: jobTitle,
        skills: selectedSkills,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      if (!result.data) {
        toast.error("Could not suggest a rate.");
        return;
      }
      setValue("hourlyRate", result.data.suggested, { shouldValidate: true });
      toast.success(
        `Suggested ${result.data.currency} ${result.data.min}–${result.data.max}/hr (set to ${result.data.suggested})`
      );
    });
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">2. Requirements &amp; Compensation</h2>
        <p className="text-sm text-slate-500">Define compensation and required skills from our catalog.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Salary currency <span className="text-red-500">*</span>
          </label>
          <select className={ONBOARDING_SELECT_CLASS} {...register("salaryCurrency")}>
            {COMPENSATION_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Hourly salary ({salaryCurrency}/hr) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="30"
            error={errors.hourlyRate?.message as string}
            {...register("hourlyRate", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Hours per Week <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="40"
            icon={<Clock size={18} />}
            error={errors.hoursPerWeek?.message as string}
            {...register("hoursPerWeek", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Monthly salary (calculated, {salaryCurrency})
          </label>
          <Input
            type="number"
            readOnly
            className="bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200"
            error={errors.monthlySalary?.message as string}
            {...register("monthlySalary", { valueAsNumber: true })}
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleSuggestSalary}
            disabled={isSuggesting}
            className="min-h-11 w-full overflow-visible px-4 py-2.5 rounded-xl border border-dashed border-slate-200 text-slate-600 hover:text-[#006e2f] hover:border-[#006e2f]/40 hover:bg-[#ebfdf2]/50 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 [-webkit-tap-highlight-color:transparent]"
          >
            <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
            <span className="min-w-0 text-center leading-snug sm:whitespace-nowrap">
              {isSuggesting ? "Calculating…" : "Suggest competitive hourly rate"}
            </span>
          </button>
        </div>
      </div>

      <SkillSelectDropdown
        label="Key required skills"
        hint="Search and select up to 5 skills from our catalog."
        value={selectedSkills}
        onChange={(skills) => setValue("skills", skills, { shouldValidate: true })}
      />
      {errors.skills ? (
        <p className="text-red-500 text-xs -mt-2">{errors.skills.message as string}</p>
      ) : null}
    </div>
  );
}
