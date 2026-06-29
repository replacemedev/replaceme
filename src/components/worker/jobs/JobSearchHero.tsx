"use client";

import { Search, MapPin } from "lucide-react";

interface JobSearchHeroProps {
  keyword: string;
  location: string;
  onKeywordChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearch: () => void;
}

export function JobSearchHero({
  keyword,
  location,
  onKeywordChange,
  onLocationChange,
  onSearch,
}: JobSearchHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#e8f7f4] via-[#f4faf8] to-[#f8fafe] px-4 sm:px-6 lg:px-8 pt-10 pb-12 sm:pt-14 sm:pb-16">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
          Find your next opportunity
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-500 font-medium max-w-2xl mx-auto">
          Discover roles at top companies matching your skills and aspirations.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearch();
          }}
          className="mt-8 max-w-3xl mx-auto bg-white rounded-2xl md:rounded-full shadow-md hover:shadow-lg border border-slate-200/80 p-3 md:p-2 flex flex-col md:flex-row md:items-center gap-0 md:gap-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-[#006e2f]/10 focus-within:border-[#006e2f]"
        >
          <label className="sr-only" htmlFor="job-keyword-search">
            Search jobs
          </label>
          <div className="flex flex-1 items-center gap-2 px-3 py-3 md:py-2 min-w-0 border-b border-slate-100 md:border-0">
            <Search className="h-4.5 w-4.5 text-slate-400 shrink-0" aria-hidden />
            <input
              id="job-keyword-search"
              type="search"
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              placeholder="Search by job title, company, or keywords..."
              className="w-full bg-transparent border-0 outline-hidden text-sm text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div className="hidden md:block w-px h-8 bg-slate-200 shrink-0" aria-hidden />

          <label className="sr-only" htmlFor="job-location-search">
            Location
          </label>
          <div className="flex flex-1 items-center gap-2 px-3 py-3 md:py-2 min-w-0 md:max-w-[14rem]">
            <MapPin className="h-4.5 w-4.5 text-slate-400 shrink-0" aria-hidden />
            <input
              id="job-location-search"
              type="search"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="City, state, or remote"
              className="w-full bg-transparent border-0 outline-hidden text-sm text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            className="shrink-0 w-full md:w-auto mt-3 md:mt-0 px-6 py-3 md:py-2.5 rounded-xl md:rounded-full bg-[#006e2f] hover:bg-[#005c26] text-white text-sm font-bold transition-all duration-200 cursor-pointer"
          >
            Search Jobs
          </button>
        </form>
      </div>
    </section>
  );
}
