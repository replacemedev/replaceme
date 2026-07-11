"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, Calendar, Filter } from "lucide-react";

export function EarningsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeSearch = searchParams.get("search") ?? "";
  const activeRange = searchParams.get("range") ?? "all_time";
  const activeStatus = searchParams.get("status") ?? "all";

  const [searchTerm, setSearchTerm] = useState(activeSearch);
  const [prevActiveSearch, setPrevActiveSearch] = useState(activeSearch);

  if (activeSearch !== prevActiveSearch) {
    setSearchTerm(activeSearch);
    setPrevActiveSearch(activeSearch);
  }

  // Debounced search logic to sync input search query to URL query parameters
  useEffect(() => {
    const handler = setTimeout(() => {
      const currentParams = new URLSearchParams(window.location.search);
      const currentSearch = currentParams.get("search") ?? "";
      
      if (currentSearch === searchTerm) return;

      const params = new URLSearchParams(window.location.search);
      if (searchTerm) {
        params.set("search", searchTerm);
      } else {
        params.delete("search");
      }
      params.delete("page"); // Reset page when search changes
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
    params.delete("page"); // Reset page on filter change
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(window.location.search);
    if (val && val !== "all") {
      params.set("status", val);
    } else {
      params.delete("status");
    }
    params.delete("page"); // Reset page on filter change
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    const params = new URLSearchParams(window.location.search);
    params.delete("search");
    params.delete("range");
    params.delete("status");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const isFiltered = activeSearch || activeRange !== "all_time" || activeStatus !== "all";

  return (
    <div className="w-full bg-white border border-slate-100 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
      {/* Search Input Container */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by client or job title..."
          className="w-full pl-11 pr-10 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 focus:border-[#006e2f] focus:bg-white rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:ring-4 focus:ring-[#006e2f]/5"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Dropdown Filters Container */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        {/* Date Range Select */}
        <div className="relative flex-1 sm:flex-initial">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Calendar size={15} />
          </div>
          <select
            value={activeRange}
            onChange={handleRangeChange}
            className="w-full sm:w-[160px] pl-9 pr-8 py-2.5 bg-white border border-slate-200/80 hover:bg-slate-50/50 focus:border-[#006e2f] rounded-2xl text-sm font-medium text-slate-750 outline-none appearance-none transition-all cursor-pointer focus:ring-4 focus:ring-[#006e2f]/5"
          >
            <option value="all_time">All Time</option>
            <option value="this_month">This Month</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="ytd">Year-to-Date</option>
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 text-[10px]">
            ▼
          </div>
        </div>

        {/* Status Select */}
        <div className="relative flex-1 sm:flex-initial">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Filter size={15} />
          </div>
          <select
            value={activeStatus}
            onChange={handleStatusChange}
            className="w-full sm:w-[150px] pl-9 pr-8 py-2.5 bg-white border border-slate-200/80 hover:bg-slate-50/50 focus:border-[#006e2f] rounded-2xl text-sm font-medium text-slate-750 outline-none appearance-none transition-all cursor-pointer focus:ring-4 focus:ring-[#006e2f]/5"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 text-[10px]">
            ▼
          </div>
        </div>

        {/* Clear Filters Button */}
        {isFiltered && (
          <button
            onClick={handleClearFilters}
            className="px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <X size={15} />
            <span>Clear</span>
          </button>
        )}
      </div>
    </div>
  );
}
