"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { HiredWorker } from "@/types/employer/hired";
import { HiredWorkerCard } from "./HiredWorkerCard";
import {
  HiredToolbar,
  HiredStatusFilter,
  HiredTypeFilter,
} from "./HiredToolbar";
import { SearchX, RotateCcw, Users } from "lucide-react";
import { useDebouncedUrlFilter } from "@/hooks/useDebouncedUrlFilter";
import { EmptyState } from "@/components/shared/EmptyState";
import { PostJobCTA } from "@/components/employer/jobs/PostJobCTA";

interface HiredWorkerListProps {
  workers: HiredWorker[];
  planSlug: string;
  messagingEnabled?: boolean;
  planUsage?: any;
}

export function HiredWorkerList({
  workers,
  planSlug,
  messagingEnabled = true,
  planUsage,
}: HiredWorkerListProps) {
  const {
    searchValue,
    handleSearchChange,
    getParam,
    setParam,
    resetAllFilters,
    searchParams,
  } = useDebouncedUrlFilter({ searchKey: "q", debounceMs: 300 });

  const statusFilter = getParam("status", "all") as HiredStatusFilter;
  const typeFilter = getParam("type", "all") as HiredTypeFilter;

  const hasActiveFilters =
    Boolean(searchParams.get("q")) ||
    Boolean(searchParams.get("status")) ||
    Boolean(searchParams.get("type"));

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      // Search query filter (name or role)
      if (searchValue.trim()) {
        const q = searchValue.toLowerCase().trim();
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
  }, [workers, searchValue, statusFilter, typeFilter]);

  return (
    <div className="space-y-6">
      {/* Responsive Search & Filter Toolbar */}
      <HiredToolbar
        searchQuery={searchValue}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={(val) => setParam("status", val)}
        typeFilter={typeFilter}
        onTypeFilterChange={(val) => setParam("type", val)}
        totalCount={workers.length}
        filteredCount={filteredWorkers.length}
      />

      {/* Workers List or Empty State */}
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
      ) : workers.length === 0 && !hasActiveFilters ? (
        <div className="space-y-4">
          <EmptyState
            icon={<Users size={22} />}
            title="No hired workers yet"
            description="When you hire a candidate from your applicant pipeline, their contract details will appear here."
            action={
              <PostJobCTA
                planUsage={planUsage}
                label="Post a job"
                compact
              />
            }
          />
          <p className="text-center text-sm text-slate-500 font-medium">
            Or review applicants in your existing pipelines.{" "}
            <Link
              href="/employer/jobs"
              className="font-bold text-[#006e2f] hover:underline"
            >
              View job posts
            </Link>
          </p>
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
            onClick={resetAllFilters}
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
