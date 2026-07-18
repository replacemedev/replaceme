"use client";

import { useMemo, useState, useTransition } from "react";
import { Filter } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Briefcase } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { JobSearchHero } from "./JobSearchHero";
import { JobFilterSidebar, JobFilterPanel } from "./JobFilterSidebar";
import { JobCard } from "./JobCard";
import { JobCardGrid } from "./JobCardGrid";
import { JobCardSkeleton } from "./JobCardSkeleton";
import { WorkerPageShell, WorkerFilterSheet } from "@/components/worker/layout";
import { TablePagination } from "@/components/shared/TablePagination";
import {
  JobSearchFacets,
  JobSearchResult,
  JobSortOption,
} from "@/types/job-search";

const PAGE_SIZE = 20;

interface JobSearchClientProps {
  initialJobs: JobSearchResult[];
  facets: JobSearchFacets;
}

function sortJobs(jobs: JobSearchResult[], sort: JobSortOption) {
  const copy = [...jobs];
  switch (sort) {
    case "newest":
      return copy.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case "salary_high":
      return copy.sort((a, b) => b.monthlySalary - a.monthlySalary);
    case "salary_low":
      return copy.sort((a, b) => a.monthlySalary - b.monthlySalary);
    case "most_relevant":
    default:
      return copy.sort((a, b) => {
        const priorityDiff = (b.priorityScore ?? 0) - (a.priorityScore ?? 0);
        if (priorityDiff !== 0) return priorityDiff;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }
}

export function JobSearchClient({
  initialJobs,
  facets,
}: JobSearchClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Single source of truth: derive search/filter inputs synchronously from searchParams
  const keyword = searchParams.get("query") || "";
  const appliedSkills = useMemo(() => {
    const s = searchParams.get("skills");
    return s ? s.split(",").filter(Boolean) : [];
  }, [searchParams]);
  const appliedEmploymentTypes = useMemo(() => {
    const t = searchParams.get("type");
    return t ? t.split(",").filter(Boolean) : [];
  }, [searchParams]);

  // Synchronize jobs state with initialJobs synchronously during render when props change
  const [jobs, setJobs] = useState(initialJobs);
  const [prevInitialJobs, setPrevInitialJobs] = useState(initialJobs);

  if (initialJobs !== prevInitialJobs) {
    setPrevInitialJobs(initialJobs);
    setJobs(initialJobs);
  }

  const [skillQuery, setSkillQuery] = useState("");
  const [sortBy, setSortBy] = useState<JobSortOption>("most_relevant");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return sortJobs(jobs, sortBy);
  }, [jobs, sortBy]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const activePage = Math.min(currentPage, totalPages || 1);
  const startIndex = (activePage - 1) * PAGE_SIZE;
  const paginatedJobs = useMemo(() => {
    return filtered.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filtered, startIndex]);

  const updateUrl = (newKeyword: string, newSkills: string[], newTypes: string[]) => {
    const params = new URLSearchParams();
    if (newKeyword.trim()) {
      params.set("query", newKeyword.trim());
    }
    if (newSkills.length > 0) {
      params.set("skills", newSkills.join(","));
    }
    if (newTypes.length > 0) {
      params.set("type", newTypes.join(","));
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleApplyFilters = (filters: {
    skills: string[];
    employmentTypes: string[];
  }) => {
    setCurrentPage(1);
    updateUrl(keyword, filters.skills, filters.employmentTypes);
  };

  const handleSearch = (newKeyword: string) => {
    setCurrentPage(1);
    updateUrl(newKeyword, appliedSkills, appliedEmploymentTypes);
  };

  const handleSkillChipToggle = (skill: string) => {
    const nextSkills = appliedSkills.includes(skill)
      ? appliedSkills.filter((s) => s !== skill)
      : [...appliedSkills, skill];

    setCurrentPage(1);
    updateUrl(keyword, nextSkills, appliedEmploymentTypes);
  };

  const handleClearAll = () => {
    setKeyword("");
    setSkillQuery("");
    setAppliedSkills([]);
    setAppliedEmploymentTypes([]);
    setCurrentPage(1);
    updateUrl("", [], []);
  };

  const handleSavedChange = (jobId: string, saved: boolean) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === jobId ? { ...job, isSaved: saved } : job))
    );
  };

  const filterPanelProps = {
    skillQuery,
    onSkillQueryChange: setSkillQuery,
    selectedSkills: appliedSkills,
    skillSuggestions: facets.skillSuggestions,
    employmentTypes: facets.employmentTypes,
    selectedEmploymentTypes: appliedEmploymentTypes,
    onApplyFilters: handleApplyFilters,
    onClearAll: handleClearAll,
  };

  return (
    <>
      <JobSearchHero
        initialKeyword={keyword}
        onSearch={handleSearch}
        activeSkills={appliedSkills}
        onSkillChipToggle={handleSkillChipToggle}
        skillSuggestions={facets.skillSuggestions}
      />

      <WorkerPageShell width="wide" className="py-8 gap-6">

        <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6">
          <JobFilterSidebar
            {...filterPanelProps}
            mobileOpen={mobileFiltersOpen}
            onMobileClose={() => setMobileFiltersOpen(false)}
          />

          <WorkerFilterSheet
            open={mobileFiltersOpen}
            onClose={() => setMobileFiltersOpen(false)}
          >
            <JobFilterPanel
              {...filterPanelProps}
              hideTitle={true}
              onClose={() => setMobileFiltersOpen(false)}
            />
          </WorkerFilterSheet>

          <section className="min-w-0 mt-6 lg:mt-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200/80 rounded-lg cursor-pointer shrink-0"
                >
                  <Filter className="h-4 w-4" aria-hidden />
                  Filters
                </button>
                <p className="text-sm font-medium text-slate-600">
                  Showing{" "}
                  <span className="font-bold text-slate-900">
                    {filtered.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-slate-900">
                    {facets.totalActiveJobs}
                  </span>{" "}
                  jobs
                </p>
              </div>

              <label className="flex items-center justify-between sm:justify-start gap-2 text-sm text-slate-600 w-full sm:w-auto">
                <span className="font-medium shrink-0">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as JobSortOption);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-auto rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#006e2f] cursor-pointer"
                >
                  <option value="most_relevant">Most Relevant</option>
                  <option value="newest">Newest</option>
                  <option value="salary_high">Salary: High to Low</option>
                  <option value="salary_low">Salary: Low to High</option>
                </select>
              </label>
            </div>

            {isPending ? (
              <JobCardGrid>
                {[...Array(5)].map((_, i) => (
                  <li key={`skeleton-${i}`}>
                    <JobCardSkeleton />
                  </li>
                ))}
              </JobCardGrid>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<Briefcase className="h-6 w-6" />}
                title="No jobs found matching your criteria"
                description="Try adjusting your filters or search terms. New employer postings will appear here automatically."
              />
            ) : (
              <div className="space-y-6">
                <JobCardGrid>
                  {paginatedJobs.map((job) => (
                    <li key={job.id}>
                      <JobCard job={job} onSavedChange={handleSavedChange} />
                    </li>
                  ))}
                </JobCardGrid>

                <TablePagination
                  totalItems={totalItems}
                  pageSize={PAGE_SIZE}
                  currentPage={activePage}
                  onPageChange={setCurrentPage}
                  label="jobs"
                  className="mt-8 px-0 py-0 border-t-0 bg-transparent"
                />
              </div>
            )}
          </section>
        </div>
      </WorkerPageShell>
    </>
  );
}
