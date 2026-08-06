"use client";

import React from "react";
import { Search, Filter } from "lucide-react";
import type { ContractStatus, EmploymentType } from "@/types/employer/hired";

export type HiredStatusFilter = "all" | ContractStatus;
export type HiredTypeFilter = "all" | EmploymentType;

const STATUS_OPTIONS: { value: HiredStatusFilter; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "terminated", label: "Terminated" },
];

const TYPE_OPTIONS: { value: HiredTypeFilter; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "full-time", label: "Full-Time" },
  { value: "part-time", label: "Part-Time" },
  { value: "contract", label: "Contract" },
];

interface HiredToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: HiredStatusFilter;
  onStatusFilterChange: (value: HiredStatusFilter) => void;
  typeFilter: HiredTypeFilter;
  onTypeFilterChange: (value: HiredTypeFilter) => void;
  totalCount: number;
  filteredCount: number;
}

export function HiredToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  totalCount,
  filteredCount,
}: HiredToolbarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all md:flex-row md:items-center md:justify-between">
      {/* Left: Responsive Search Bar */}
      <div className="relative w-full md:w-72 md:max-w-sm shrink-0">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          type="search"
          placeholder="Search by name, role..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder:text-slate-400 transition-all focus:bg-white focus:border-[#006e2f] focus:outline-none focus:ring-2 focus:ring-[#006e2f]/20"
        />
      </div>

      {/* Right: Filters & Responsive Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end flex-1 min-w-0">
        {/* Status Filter Pills */}
        <div
          className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none"
          role="group"
          aria-label="Filter by contract status"
        >
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onStatusFilterChange(opt.value)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                statusFilter === opt.value
                  ? "bg-[#006e2f] text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Employment Type & Counter Badge */}
        <div className="flex items-center gap-2.5 justify-between sm:justify-end w-full sm:w-auto shrink-0">
          {/* Employment Type Dropdown */}
          <label className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-xs hover:border-slate-300">
            <Filter size={14} className="text-slate-400 shrink-0" aria-hidden />
            <select
              value={typeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value as HiredTypeFilter)}
              className="cursor-pointer bg-transparent focus:outline-none text-slate-700 font-semibold"
              aria-label="Filter by employment type"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          {/* Counter Badge */}
          <div className="flex h-10 items-center rounded-xl border border-slate-100 bg-slate-50 px-3 text-xs font-semibold text-slate-500 shrink-0">
            <span className="mr-1 font-extrabold text-[#006e2f]">{filteredCount}</span>
            {filteredCount === 1 ? "Worker" : "Workers"}
          </div>
        </div>
      </div>
    </div>
  );
}
