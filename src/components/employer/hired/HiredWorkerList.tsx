"use client";

import React, { useState, useMemo } from "react";
import { HiredWorker } from "@/types/employer/hired";
import { HiredWorkerCard } from "./HiredWorkerCard";
import {
  HiredToolbar,
  HiredStatusFilter,
  HiredTypeFilter,
} from "./HiredToolbar";
import { SearchX, RotateCcw } from "lucide-react";

interface HiredWorkerListProps {
  workers: HiredWorker[];
  planSlug: string;
  messagingEnabled?: boolean;
}

export function HiredWorkerList({
  workers,
  planSlug,
  messagingEnabled = true,
}: HiredWorkerListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<HiredStatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<HiredTypeFilter>("all");

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      // Search query filter (name or role)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = worker.name.toLowerCase().includes(q);
        const matchRole = worker.role.toLowerCase().includes(q);
        if (!matchName && !matchRole) return false;
      }

      // Status filter
      if (statusFilter !== "all" && worker.status !== statusFilter) {
        return false;
      }

      // Employment type filter
      if (typeFilter !== "all" && worker.employmentType !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [workers, searchQuery, statusFilter, typeFilter]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  if (workers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Responsive Search & Filter Toolbar */}
      <HiredToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        totalCount={workers.length}
        filteredCount={filteredWorkers.length}
      />

      {/* Workers List or Empty Filter Results */}
      {filteredWorkers.length > 0 ? (
        <div className="space-y-4">
          {filteredWorkers.map((worker) => (
            <HiredWorkerCard
              key={worker.id}
              worker={worker}
              planSlug={planSlug}
              messagingEnabled={messagingEnabled}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-8 sm:p-12 text-center shadow-sm space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <SearchX size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No hired workers match your filters
          </h3>
          <p className="text-xs text-slate-500 max-w-sm font-medium">
            Try adjusting your search keywords, status, or employment type filters.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 cursor-pointer mt-2"
          >
            <RotateCcw size={14} />
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
}
