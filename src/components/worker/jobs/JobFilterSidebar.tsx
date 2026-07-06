"use client";

import { useEffect, useState } from "react";
import { EmploymentTypeFacet } from "@/types/job-search";

interface JobFilterSidebarProps {
  skillQuery: string;
  onSkillQueryChange: (value: string) => void;
  selectedSkills: string[];
  skillSuggestions: string[];
  employmentTypes: EmploymentTypeFacet[];
  selectedEmploymentTypes: string[];
  salaryMin: number;
  salaryMax: number;
  currency: string;
  onApplyFilters: (filters: {
    skills: string[];
    employmentTypes: string[];
    salaryMin: number;
    salaryMax: number;
    currency: string;
  }) => void;
  onClearAll: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const CURRENCY_CONFIGS: Record<string, { max: number; step: number; symbol: string }> = {
  PHP: { max: 200000, step: 1000, symbol: "₱" },
  USD: { max: 15000, step: 100, symbol: "$" },
  EUR: { max: 15000, step: 100, symbol: "€" },
  GBP: { max: 15000, step: 100, symbol: "£" },
};

export function JobFilterPanel({
  skillQuery,
  onSkillQueryChange,
  selectedSkills: initialSelectedSkills,
  skillSuggestions,
  employmentTypes,
  selectedEmploymentTypes: initialSelectedEmploymentTypes,
  salaryMin: initialSalaryMin,
  salaryMax: initialSalaryMax,
  currency: initialCurrency,
  onApplyFilters,
  onClearAll,
}: Omit<JobFilterSidebarProps, "mobileOpen" | "onMobileClose">) {
  // Local states
  const [localSkills, setLocalSkills] = useState(initialSelectedSkills);
  const [localEmploymentTypes, setLocalEmploymentTypes] = useState(initialSelectedEmploymentTypes);
  const [localCurrency, setLocalCurrency] = useState(initialCurrency);
  const [localSalaryMin, setLocalSalaryMin] = useState(initialSalaryMin);
  const [localSalaryMax, setLocalSalaryMax] = useState(initialSalaryMax);

  // Sync state if initial props change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalSkills(initialSelectedSkills);
  }, [initialSelectedSkills]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalEmploymentTypes(initialSelectedEmploymentTypes);
  }, [initialSelectedEmploymentTypes]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalCurrency(initialCurrency);
  }, [initialCurrency]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalSalaryMin(initialSalaryMin);
  }, [initialSalaryMin]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalSalaryMax(initialSalaryMax);
  }, [initialSalaryMax]);

  const handleLocalSkillToggle = (skill: string) => {
    setLocalSkills((prev) => {
      if (prev.includes(skill)) return prev.filter((s) => s !== skill);
      if (prev.length >= 3) return prev;
      return [...prev, skill];
    });
  };

  const handleLocalEmploymentToggle = (type: string) => {
    setLocalEmploymentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleLocalCurrencyChange = (newCurr: string) => {
    setLocalCurrency(newCurr);
    const config = CURRENCY_CONFIGS[newCurr] || CURRENCY_CONFIGS.PHP;
    setLocalSalaryMin(0);
    setLocalSalaryMax(config.max);
  };

  const handleApplyClick = () => {
    onApplyFilters({
      skills: localSkills,
      employmentTypes: localEmploymentTypes,
      salaryMin: localSalaryMin,
      salaryMax: localSalaryMax,
      currency: localCurrency,
    });
  };

  const currentConfig = CURRENCY_CONFIGS[localCurrency] || CURRENCY_CONFIGS.PHP;

  const filteredSuggestions = skillSuggestions
    .filter((s) => s.toLowerCase().includes(skillQuery.toLowerCase()))
    .slice(0, 12);

  return (
    <aside className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold text-slate-900">Filters</h2>
        <button
          type="button"
          onClick={onClearAll}
          className="text-[11px] font-bold uppercase tracking-wide text-[#006e2f] hover:underline cursor-pointer"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Skills
          </p>
          <input
            type="search"
            value={skillQuery}
            onChange={(e) => onSkillQueryChange(e.target.value)}
            placeholder="Search skills (max 3)"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-[#006e2f] focus:border-[#006e2f]"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {localSkills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => handleLocalSkillToggle(skill)}
                className="inline-flex items-center gap-1 rounded-full bg-[#006e2f] text-white px-2.5 py-1 text-[11px] font-semibold cursor-pointer"
              >
                {skill}
                <span aria-hidden>×</span>
              </button>
            ))}
            {filteredSuggestions
              .filter((s) => !localSkills.includes(s))
              .slice(0, 6)
              .map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleLocalSkillToggle(skill)}
                  disabled={localSkills.length >= 3}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white text-slate-600 px-2.5 py-1 text-[11px] font-semibold hover:border-[#006e2f] hover:text-[#006e2f] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  {skill}
                </button>
              ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Employment Type
          </p>
          <ul className="space-y-2">
            {employmentTypes.length === 0 ? (
              <li className="text-xs text-slate-400">No employment types yet</li>
            ) : (
              employmentTypes.map(({ type, count }) => {
                const checked = localEmploymentTypes.includes(type);
                return (
                  <li key={type}>
                    <label className="flex items-center justify-between gap-3 cursor-pointer group">
                      <span className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleLocalEmploymentToggle(type)}
                          className="h-4 w-4 rounded border-slate-300 text-[#006e2f] focus:ring-[#006e2f]/30 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 truncate">
                          {type}
                        </span>
                      </span>
                      <span className="text-xs font-semibold text-slate-400 shrink-0">
                        {count}
                      </span>
                    </label>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Salary Currency
          </p>
          <select
            value={localCurrency}
            onChange={(e) => handleLocalCurrencyChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#006e2f] cursor-pointer mb-4"
          >
            <option value="PHP">PHP (₱)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>

          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
            Salary Range
          </p>
          <div className="space-y-3">
            <input
              type="range"
              min={0}
              max={currentConfig.max}
              step={currentConfig.step}
              value={localSalaryMin}
              onChange={(e) =>
                setLocalSalaryMin(Math.min(Number(e.target.value), localSalaryMax))
              }
              className="w-full accent-[#006e2f]"
              aria-label="Minimum salary"
            />
            <input
              type="range"
              min={0}
              max={currentConfig.max}
              step={currentConfig.step}
              value={localSalaryMax}
              onChange={(e) =>
                setLocalSalaryMax(Math.max(Number(e.target.value), localSalaryMin))
              }
              className="w-full accent-[#006e2f]"
              aria-label="Maximum salary"
            />
            <div className="flex justify-between text-xs font-semibold text-slate-500">
              <span>{currentConfig.symbol}{localSalaryMin.toLocaleString()}</span>
              <span>{currentConfig.symbol}{localSalaryMax.toLocaleString()}{localSalaryMax >= currentConfig.max ? "+" : ""}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 mt-6">
        <button
          type="button"
          onClick={handleApplyClick}
          className="w-full inline-flex items-center justify-center rounded-xl bg-[#006e2f] hover:bg-[#005c26] text-white px-4 py-2.5 text-sm font-bold shadow-xs transition-colors cursor-pointer"
        >
          Apply Filters
        </button>
      </div>
    </aside>
  );
}

export function JobFilterSidebar(props: JobFilterSidebarProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { mobileOpen, onMobileClose, ...panelProps } = props;

  return (
    <div className="hidden lg:block">
      <JobFilterPanel {...panelProps} />
    </div>
  );
}
