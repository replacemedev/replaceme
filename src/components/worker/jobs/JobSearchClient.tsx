"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Briefcase } from "lucide-react";
import { JobSearchHero } from "./JobSearchHero";
import { JobFilterSidebar, JobFilterPanel } from "./JobFilterSidebar";
import { JobCard } from "./JobCard";
import { JobCardGrid } from "./JobCardGrid";
import { WorkerPageShell, WorkerFilterSheet } from "@/components/worker/layout";
import { TablePagination } from "@/components/shared/TablePagination";
import {
  JobSearchFacets,
  JobSearchResult,
  JobSortOption,
  SALARY_SLIDER_MAX,
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
  const [jobs, setJobs] = useState(initialJobs);
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [skillQuery, setSkillQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState<
    string[]
  >([]);
  const [salaryMin, setSalaryMin] = useState(0);
  const [salaryMax, setSalaryMax] = useState(
    facets.salaryMax || SALARY_SLIDER_MAX
  );
  const [sortBy, setSortBy] = useState<JobSortOption>("most_relevant");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setJobs(initialJobs);
  }, [initialJobs]);

  const [prevFilterState, setPrevFilterState] = useState({
    keyword,
    location,
    selectedSkills,
    selectedEmploymentTypes,
    salaryMin,
    salaryMax,
    sortBy,
  });

  if (
    keyword !== prevFilterState.keyword ||
    location !== prevFilterState.location ||
    selectedSkills !== prevFilterState.selectedSkills ||
    selectedEmploymentTypes !== prevFilterState.selectedEmploymentTypes ||
    salaryMin !== prevFilterState.salaryMin ||
    salaryMax !== prevFilterState.salaryMax ||
    sortBy !== prevFilterState.sortBy
  ) {
    setPrevFilterState({
      keyword,
      location,
      selectedSkills,
      selectedEmploymentTypes,
      salaryMin,
      salaryMax,
      sortBy,
    });
    setCurrentPage(1);
  }

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    const loc = location.trim().toLowerCase();

    const result = jobs.filter((job) => {
      const matchesKeyword =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.companyName.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q) ||
        job.skills.some((s) => s.toLowerCase().includes(q));

      const matchesLocation =
        !loc ||
        job.location.toLowerCase().includes(loc) ||
        (loc.includes("remote") && job.location.toLowerCase().includes("remote"));

      const matchesEmployment =
        selectedEmploymentTypes.length === 0 ||
        selectedEmploymentTypes.includes(job.employmentType);

      const matchesSkills =
        selectedSkills.length === 0 ||
        selectedSkills.every((skill) =>
          job.skills.some((s) => s.toLowerCase() === skill.toLowerCase())
        );

      const matchesSalary =
        job.monthlySalary >= salaryMin && job.monthlySalary <= salaryMax;

      return (
        matchesKeyword &&
        matchesLocation &&
        matchesEmployment &&
        matchesSkills &&
        matchesSalary
      );
    });

    return sortJobs(result, sortBy);
  }, [
    jobs,
    keyword,
    location,
    selectedEmploymentTypes,
    selectedSkills,
    salaryMin,
    salaryMax,
    sortBy,
  ]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const activePage = Math.min(currentPage, totalPages || 1);
  const startIndex = (activePage - 1) * PAGE_SIZE;
  const paginatedJobs = useMemo(() => {
    return filtered.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filtered, startIndex]);

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) => {
      if (prev.includes(skill)) return prev.filter((s) => s !== skill);
      if (prev.length >= 3) return prev;
      return [...prev, skill];
    });
    setCurrentPage(1);
  };

  const handleClearAll = () => {
    setKeyword("");
    setLocation("");
    setSkillQuery("");
    setSelectedSkills([]);
    setSelectedEmploymentTypes([]);
    setSalaryMin(0);
    setSalaryMax(facets.salaryMax || SALARY_SLIDER_MAX);
    setSortBy("most_relevant");
    setCurrentPage(1);
  };

  const handleSavedChange = (jobId: string, saved: boolean) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === jobId ? { ...job, isSaved: saved } : job))
    );
  };

  const filterPanelProps = {
    skillQuery,
    onSkillQueryChange: setSkillQuery,
    selectedSkills,
    onSkillToggle: handleSkillToggle,
    skillSuggestions: facets.skillSuggestions,
    employmentTypes: facets.employmentTypes,
    selectedEmploymentTypes,
    onEmploymentTypeToggle: (type: string) => {
      setSelectedEmploymentTypes((prev) =>
        prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
      );
      setCurrentPage(1);
    },
    salaryMin,
    salaryMax,
    onSalaryMinChange: setSalaryMin,
    onSalaryMaxChange: setSalaryMax,
    onClearAll: handleClearAll,
  };

  return (
    <>
      <JobSearchHero
        keyword={keyword}
        location={location}
        onKeywordChange={setKeyword}
        onLocationChange={setLocation}
        onSearch={() => setCurrentPage(1)}
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
            <JobFilterPanel {...filterPanelProps} />
          </WorkerFilterSheet>

          <section className="min-w-0 mt-6 lg:mt-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg cursor-pointer shrink-0"
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

            {filtered.length === 0 ? (
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
