"use client";

import React from "react";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";

interface ApplicantsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  totalCount: number;
}

export function ApplicantsToolbar({
  searchQuery,
  onSearchChange,
  totalCount,
}: ApplicantsToolbarProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search candidates..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:bg-white transition-all font-body-base"
        />
      </div>

      {/* Filter and Sort actions */}
      <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0">
        <div className="flex gap-2">
          <button
            type="button"
            className="h-10 px-4 bg-white border border-slate-100 hover:border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-colors"
          >
            <SlidersHorizontal size={14} className="text-slate-400" />
            Filter
          </button>
          <button
            type="button"
            className="h-10 px-4 bg-white border border-slate-100 hover:border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-colors"
          >
            <ArrowUpDown size={14} className="text-slate-400" />
            Sort
          </button>
        </div>

        {/* Total count indicator */}
        <div className="text-xs text-slate-400 font-semibold border-l border-slate-100 pl-4 h-6 flex items-center">
          <span className="font-bold text-slate-700 mr-1">{totalCount}</span> Total Applicants
        </div>
      </div>
    </div>
  );
}
