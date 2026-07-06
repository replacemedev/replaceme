"use client";

import { useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";

interface JobSearchHeroProps {
  initialKeyword: string;
  onSearch: (keyword: string) => void;
  activeSkills: string[];
  onSkillChipToggle: (skill: string) => void;
  skillSuggestions: string[];
}

export function JobSearchHero({
  initialKeyword,
  onSearch,
  activeSkills,
  onSkillChipToggle,
  skillSuggestions,
}: JobSearchHeroProps) {
  const [localKeyword, setLocalKeyword] = useState(initialKeyword);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalKeyword(initialKeyword);
  }, [initialKeyword]);

  const quickSkills = useMemo(() => {
    const defaults = [""];
    const merged = [...defaults, ...skillSuggestions];
    return Array.from(new Set(merged)).slice(0, 8);
  }, [skillSuggestions]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#e8f7f4] via-[#f4faf8] to-[#f8fafe] pt-10 pb-12 sm:pt-14 sm:pb-16">
      <div className="px-4 mx-auto max-w-5xl text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
          Find your next opportunity
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-500 font-medium max-w-2xl mx-auto">
          Discover roles at top companies matching your skills and aspirations.
        </p>

        <div className="mt-8 max-w-3xl mx-auto w-full">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSearch(localKeyword);
            }}
            className="flex flex-col sm:flex-row items-center gap-2 sm:gap-0 bg-white rounded-2xl sm:rounded-full p-2.5 sm:p-2 border border-slate-200/80 shadow-sm focus-within:ring-2 focus-within:ring-[#006e2f]/10 focus-within:border-[#006e2f] transition-all duration-300 w-full"
          >
            <label className="sr-only" htmlFor="job-keyword-search">
              Search by job title
            </label>
            <div className="flex flex-1 items-center gap-2 px-3 py-1 min-w-0 w-full">
              <Search className="h-4.5 w-4.5 text-slate-400 shrink-0" aria-hidden />
              <input
                id="job-keyword-search"
                type="search"
                value={localKeyword}
                onChange={(e) => setLocalKeyword(e.target.value)}
                placeholder="Search by job title..."
                className="w-full bg-transparent border-0 outline-hidden text-sm text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              className="shrink-0 w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl sm:rounded-full bg-[#006e2f] hover:bg-[#005c26] text-white text-sm font-bold transition-all duration-200 cursor-pointer"
            >
              Search Jobs
            </button>
          </form>
        </div>

        {/* Quick Skills Filter row */}
        <div className="flex flex-wrap gap-2 justify-center mt-5 max-w-3xl mx-auto w-full">
          {quickSkills.map((skill) => {
            const isActive = activeSkills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => onSkillChipToggle(skill)}
                className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${isActive
                  ? "bg-[#006e2f] text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
