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
  onApplyFilters: (filters: {
    skills: string[];
    employmentTypes: string[];
  }) => void;
  onClearAll: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  hideTitle?: boolean;
}

export function JobFilterPanel({
  skillQuery,
  onSkillQueryChange,
  selectedSkills: initialSelectedSkills,
  skillSuggestions,
  employmentTypes,
  selectedEmploymentTypes: initialSelectedEmploymentTypes,
  onApplyFilters,
  onClearAll,
  hideTitle = false,
  onClose,
}: Omit<JobFilterSidebarProps, "mobileOpen" | "onMobileClose"> & {
  onClose?: () => void;
}) {
  // Local states
  const [localSkills, setLocalSkills] = useState(initialSelectedSkills);
  const [localEmploymentTypes, setLocalEmploymentTypes] = useState(initialSelectedEmploymentTypes);

  // Sync state if initial props change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalSkills(initialSelectedSkills);
  }, [initialSelectedSkills]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalEmploymentTypes(initialSelectedEmploymentTypes);
  }, [initialSelectedEmploymentTypes]);

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

  const handleApplyClick = () => {
    onApplyFilters({
      skills: localSkills,
      employmentTypes: localEmploymentTypes,
    });
    if (onClose) {
      onClose();
    }
  };

  const getFacetCount = (type: string) => {
    const match = employmentTypes.find(
      (et) => et.type.toLowerCase() === type.toLowerCase()
    );
    return match ? match.count : 0;
  };

  const filteredSuggestions = skillSuggestions
    .filter((s) => s.toLowerCase().includes(skillQuery.toLowerCase()))
    .slice(0, 12);

  return (
    <aside className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        {!hideTitle && (
          <h2 className="text-sm font-bold text-slate-900">Filters</h2>
        )}
        <button
          type="button"
          onClick={onClearAll}
          className={`text-[11px] font-bold uppercase tracking-wide text-[#006e2f] hover:underline cursor-pointer ${
            hideTitle ? "ml-auto" : ""
          }`}
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
            {["Full-time", "Part-time", "Contract"].map((type) => {
              const checked = localEmploymentTypes.includes(type);
              const count = getFacetCount(type);
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
            })}
          </ul>
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
