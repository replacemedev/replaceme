"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, Calendar } from "lucide-react";

export function EarningsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeSearch = searchParams.get("search") ?? "";
  const activeRange = searchParams.get("range") ?? "all_time";

  const [searchTerm, setSearchTerm] = useState(activeSearch);
  const [prevActiveSearch, setPrevActiveSearch] = useState(activeSearch);

  // Sync input if URL param changes externally (e.g. clear button)
  if (activeSearch !== prevActiveSearch) {
    setSearchTerm(activeSearch);
    setPrevActiveSearch(activeSearch);
  }

  // Debounced push to URL — 400ms after the user stops typing
  React.useEffect(() => {
    const handler = setTimeout(() => {
      const current = new URLSearchParams(window.location.search).get("search") ?? "";
      if (current === searchTerm) return;

      const params = new URLSearchParams(window.location.search);
      if (searchTerm) {
        params.set("search", searchTerm);
      } else {
        params.delete("search");
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, pathname, router]);

  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(window.location.search);
    if (val && val !== "all_time") {
      params.set("range", val);
    } else {
      params.delete("range");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleClear = () => {
    setSearchTerm("");
    router.push(pathname, { scroll: false });
  };

  const isFiltered = activeSearch || activeRange !== "all_time";

  return (
    <div className="w-full bg-white border border-slate-100 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
          <Search size={17} />
        </div>
        <input
          id="earnings-search"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by employer or job title…"
          className="w-full pl-11 pr-10 py-2.5 bg-slate-50/60 hover:bg-slate-50 border border-slate-200/80 focus:border-[#006e2f] focus:bg-white rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:ring-4 focus:ring-[#006e2f]/5"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Date Range Select */}
      <div className="relative flex-1 md:flex-initial">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
          <Calendar size={15} />
        </div>
        <select
          id="earnings-range"
          value={activeRange}
          onChange={handleRangeChange}
          className="w-full md:w-[165px] pl-9 pr-8 py-2.5 bg-white border border-slate-200/80 hover:bg-slate-50/50 focus:border-[#006e2f] rounded-2xl text-sm font-medium text-slate-700 outline-none appearance-none cursor-pointer transition-all focus:ring-4 focus:ring-[#006e2f]/5"
        >
          <option value="all_time">All Time</option>
          <option value="this_month">This Month</option>
          <option value="last_30_days">Last 30 Days</option>
          <option value="ytd">Year-to-Date</option>
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 text-[10px]">▼</div>
      </div>

      {/* Clear Filters */}
      {isFiltered && (
        <button
          onClick={handleClear}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer"
        >
          <X size={14} />
          <span>Clear</span>
        </button>
      )}
    </div>
  );
}
