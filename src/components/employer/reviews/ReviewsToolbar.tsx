"use client";

import React from "react";
import { Search } from "lucide-react";

export type ReviewStatusFilter = "all" | "pending" | "reviewed";

const STATUS_OPTIONS: { value: ReviewStatusFilter; label: string }[] = [
  { value: "all", label: "All Hires" },
  { value: "pending", label: "Pending Review" },
  { value: "reviewed", label: "Reviewed" },
];

interface ReviewsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: ReviewStatusFilter;
  onStatusFilterChange: (value: ReviewStatusFilter) => void;
  totalCount: number;
  filteredCount: number;
}

export function ReviewsToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  totalCount,
  filteredCount,
}: ReviewsToolbarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all md:flex-row md:items-center md:justify-between">
      {/* Left: Responsive Search Input */}
      <div className="relative w-full md:w-72 md:max-w-sm shrink-0">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          type="search"
          placeholder="Search by worker name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder:text-slate-400 transition-all focus:bg-white focus:border-[#006e2f] focus:outline-none focus:ring-2 focus:ring-[#006e2f]/20"
        />
      </div>

      {/* Right: Status Filters & Counter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end flex-1 min-w-0">
        {/* Status Filter Pills */}
        <div
          className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none"
          role="group"
          aria-label="Filter by review status"
        >
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onStatusFilterChange(opt.value)}
              className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                statusFilter === opt.value
                  ? "bg-[#006e2f] text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Counter Badge */}
        <div className="flex h-10 items-center justify-between sm:justify-start rounded-xl border border-slate-100 bg-slate-50 px-3 text-xs font-semibold text-slate-500 shrink-0">
          <div>
            <span className="mr-1 font-extrabold text-[#006e2f]">{filteredCount}</span>
            {filteredCount === 1 ? "Worker" : "Workers"}
          </div>
          {filteredCount !== totalCount && (
            <span className="ml-1.5 text-[11px] text-slate-400 font-normal">
              (of {totalCount})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
