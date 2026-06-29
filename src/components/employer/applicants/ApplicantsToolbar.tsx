"use client";

import React from "react";
import { Search, ArrowUpDown } from "lucide-react";
import type { ApplicationStatus } from "@/types/applications";

export type ApplicantStatusFilter = "all" | ApplicationStatus;
export type ApplicantSortKey = "newest" | "oldest" | "match" | "name";

const STATUS_OPTIONS: { value: ApplicantStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "New" },
  { value: "UNDER_REVIEW", label: "Review" },
  { value: "INTERVIEW_SCHEDULED", label: "Interview" },
  { value: "HIRED", label: "Hired" },
  { value: "REJECTED", label: "Declined" },
];

const SORT_OPTIONS: { value: ApplicantSortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "match", label: "Best match" },
  { value: "name", label: "Name A–Z" },
];

interface ApplicantsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  totalCount: number;
  statusFilter: ApplicantStatusFilter;
  onStatusFilterChange: (value: ApplicantStatusFilter) => void;
  sortKey: ApplicantSortKey;
  onSortKeyChange: (value: ApplicantSortKey) => void;
}

export function ApplicantsToolbar({
  searchQuery,
  onSearchChange,
  totalCount,
  statusFilter,
  onStatusFilterChange,
  sortKey,
  onSortKeyChange,
}: ApplicantsToolbarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="relative max-w-md flex-1">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          placeholder="Search candidates..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 w-full rounded-lg border border-slate-100 bg-slate-50 pl-10 pr-4 text-xs font-body-base placeholder:text-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006e2f]/30"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div
          className="flex gap-1 overflow-x-auto pb-1 sm:pb-0"
          role="group"
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onStatusFilterChange(opt.value)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === opt.value
                  ? "bg-[#006e2f] text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <label className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-slate-100 bg-white px-3 text-xs font-bold text-slate-600">
            <ArrowUpDown size={14} className="text-slate-400" aria-hidden />
            <select
              value={sortKey}
              onChange={(e) =>
                onSortKeyChange(e.target.value as ApplicantSortKey)
              }
              className="cursor-pointer bg-transparent focus:outline-none"
              aria-label="Sort applicants"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex h-6 items-center border-l border-slate-100 pl-4 text-xs font-semibold text-slate-400">
            <span className="mr-1 font-bold text-slate-700">{totalCount}</span>
            Total
          </div>
        </div>
      </div>
    </div>
  );
}
