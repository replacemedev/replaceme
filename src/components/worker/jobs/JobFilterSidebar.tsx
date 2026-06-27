"use client";

import { EmploymentTypeFacet, SALARY_SLIDER_MAX } from "@/types/job-search";

interface JobFilterSidebarProps {
  skillQuery: string;
  onSkillQueryChange: (value: string) => void;
  selectedSkills: string[];
  onSkillToggle: (skill: string) => void;
  skillSuggestions: string[];
  employmentTypes: EmploymentTypeFacet[];
  selectedEmploymentTypes: string[];
  onEmploymentTypeToggle: (type: string) => void;
  salaryMin: number;
  salaryMax: number;
  onSalaryMinChange: (value: number) => void;
  onSalaryMaxChange: (value: number) => void;
  onClearAll: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function JobFilterPanel({
  skillQuery,
  onSkillQueryChange,
  selectedSkills,
  onSkillToggle,
  skillSuggestions,
  employmentTypes,
  selectedEmploymentTypes,
  onEmploymentTypeToggle,
  salaryMin,
  salaryMax,
  onSalaryMinChange,
  onSalaryMaxChange,
  onClearAll,
}: Omit<JobFilterSidebarProps, "mobileOpen" | "onMobileClose">) {
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
            {selectedSkills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => onSkillToggle(skill)}
                className="inline-flex items-center gap-1 rounded-full bg-[#006e2f] text-white px-2.5 py-1 text-[11px] font-semibold cursor-pointer"
              >
                {skill}
                <span aria-hidden>×</span>
              </button>
            ))}
            {filteredSuggestions
              .filter((s) => !selectedSkills.includes(s))
              .slice(0, 6)
              .map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => onSkillToggle(skill)}
                  disabled={selectedSkills.length >= 3}
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
                const checked = selectedEmploymentTypes.includes(type);
                return (
                  <li key={type}>
                    <label className="flex items-center justify-between gap-3 cursor-pointer group">
                      <span className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onEmploymentTypeToggle(type)}
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
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
            Salary Range
          </p>
          <div className="space-y-3">
            <input
              type="range"
              min={0}
              max={SALARY_SLIDER_MAX}
              step={1000}
              value={salaryMin}
              onChange={(e) =>
                onSalaryMinChange(Math.min(Number(e.target.value), salaryMax))
              }
              className="w-full accent-[#006e2f]"
              aria-label="Minimum salary"
            />
            <input
              type="range"
              min={0}
              max={SALARY_SLIDER_MAX}
              step={1000}
              value={salaryMax}
              onChange={(e) =>
                onSalaryMaxChange(Math.max(Number(e.target.value), salaryMin))
              }
              className="w-full accent-[#006e2f]"
              aria-label="Maximum salary"
            />
            <div className="flex justify-between text-xs font-semibold text-slate-500">
              <span>${Math.round(salaryMin / 1000)}k</span>
              <span>${Math.round(salaryMax / 1000)}k+</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function JobFilterSidebar(props: JobFilterSidebarProps) {
  const { mobileOpen: _mobileOpen, onMobileClose: _onMobileClose, ...panelProps } =
    props;

  return (
    <div className="hidden lg:block">
      <JobFilterPanel {...panelProps} />
    </div>
  );
}
