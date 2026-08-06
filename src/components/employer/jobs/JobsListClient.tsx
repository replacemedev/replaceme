"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Briefcase, Search, ArrowUpDown } from "lucide-react";
import type { JobPost } from "@/types/employer";
import { JobCard } from "@/components/employer/JobCard";
import { PostJobCTA } from "@/components/employer/jobs/PostJobCTA";
import { EmptyState } from "@/components/shared/EmptyState";
import type { EmployerPlanUsage } from "@/lib/server/entitlements";
import { EMPLOYER_CARD } from "@/lib/employer/ui-tokens";
import { useDebouncedUrlFilter } from "@/hooks/useDebouncedUrlFilter";

type StatusFilter =
  | "all"
  | "Active"
  | "Pending Review"
  | "Rejected"
  | "Closed"
  | "Draft";
type SortKey = "newest" | "oldest" | "applicants" | "views";

interface JobsListClientProps {
  jobs: JobPost[];
  planUsage: EmployerPlanUsage | null;
  applicantsPerJobLimit: number | null;
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Active", label: "Active" },
  { value: "Pending Review", label: "Pending" },
  { value: "Rejected", label: "Rejected" },
  { value: "Closed", label: "Closed" },
  { value: "Draft", label: "Draft" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "applicants", label: "Most applicants" },
  { value: "views", label: "Most views" },
];

export function JobsListClient({
  jobs,
  planUsage,
  applicantsPerJobLimit,
}: JobsListClientProps) {
  const {
    searchValue,
    handleSearchChange,
    getParam,
    setParam,
    resetAllFilters,
    searchParams,
  } = useDebouncedUrlFilter({ searchKey: "q", debounceMs: 300 });

  const statusFilter = getParam("status", "all") as StatusFilter;
  const sortKey = getParam("sort", "newest") as SortKey;

  const hasActiveFilters =
    Boolean(searchParams.get("q")) ||
    Boolean(searchParams.get("status")) ||
    Boolean(searchParams.get("sort"));

  const filteredJobs = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    let result = jobs.filter((job) => {
      const matchesSearch =
        !query || job.title.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "all" || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    result = [...result].sort((a, b) => {
      switch (sortKey) {
        case "oldest":
          return (
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
          );
        case "applicants":
          return b.applicants_count - a.applicants_count;
        case "views":
          return b.hits_count - a.hits_count;
        case "newest":
        default:
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );
      }
    });

    return result;
  }, [jobs, searchValue, statusFilter, sortKey]);

  return (
    <div className="space-y-6">
      <div
        className={`${EMPLOYER_CARD} flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between`}
      >
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search job titles..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006e2f]/30 focus:bg-white transition-all font-medium"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <div
            className="flex gap-1 overflow-x-auto pb-1 sm:pb-0"
            role="group"
            aria-label="Filter by status"
          >
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setParam("status", opt.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  statusFilter === opt.value
                    ? "bg-[#006e2f] text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <label className="inline-flex w-full sm:w-auto items-center justify-between sm:justify-start gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <ArrowUpDown size={13} className="text-slate-400" aria-hidden />
              <span>Sort by:</span>
            </span>
            <select
              value={sortKey}
              onChange={(e) => setParam("sort", e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-right sm:text-left flex-1 sm:flex-initial"
              aria-label="Sort jobs"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              applicantsPerJobLimit={applicantsPerJobLimit}
            />
          ))}
        </div>
      ) : jobs.length === 0 && !hasActiveFilters ? (
        <div className="space-y-4">
          <EmptyState
            icon={<Briefcase size={22} />}
            description="You haven't posted any jobs yet. Create your first listing to start hiring."
            action={
              <PostJobCTA
                planUsage={planUsage}
                label="Post a New Job"
                compact
              />
            }
          />
          <p className="text-center text-sm text-slate-500 font-medium">
            Compare plans and unlock messaging, full profiles, and instant
            approval.{" "}
            <Link
              href="/employer/pricing"
              className="font-bold text-[#006e2f] hover:underline"
            >
              View pricing
            </Link>
          </p>
        </div>
      ) : (
        <div className={`${EMPLOYER_CARD} p-10 text-center space-y-3`}>
          <p className="text-sm font-bold text-slate-800">
            No jobs match your filters
          </p>
          <p className="text-xs text-slate-500 font-medium">
            Try a different status or search term.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Reset search & filters
          </button>
        </div>
      )}

      {jobs.length > 0 && (
        <div className="flex justify-center pt-2">
          <PostJobCTA planUsage={planUsage} />
        </div>
      )}
    </div>
  );
}
