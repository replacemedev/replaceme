"use client";

import { useMemo, useState } from "react";
import {
  Download,
  ChevronDown,
  Filter,
  FileText,
  Hourglass,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ApplicationStatCard } from "./ApplicationStatCard";
import { ApplicationFilterSidebar } from "./ApplicationFilterSidebar";
import { ApplicationRow } from "./ApplicationRow";
import {
  ApplicationDateFilter,
  ApplicationSortOption,
  WorkerApplication,
  WorkerApplicationStats,
  WorkerApplicationStatus,
} from "@/types/applications";

const PAGE_SIZE = 10;

interface ApplicationsClientProps {
  applications: WorkerApplication[];
  stats: WorkerApplicationStats;
}

function matchesDateFilter(
  createdAt: string,
  filter: ApplicationDateFilter
): boolean {
  if (filter === "anytime") return true;
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const days =
    filter === "last_7_days" ? 7 : filter === "last_30_days" ? 30 : 90;
  return created >= now - days * 24 * 60 * 60 * 1000;
}

function sortApplications(
  items: WorkerApplication[],
  sort: ApplicationSortOption
): WorkerApplication[] {
  const sorted = [...items];
  switch (sort) {
    case "oldest":
      return sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    case "status":
      return sorted.sort((a, b) => a.status.localeCompare(b.status));
    case "rate_high":
      return sorted.sort(
        (a, b) => (b.hourlyRate ?? 0) - (a.hourlyRate ?? 0)
      );
    case "rate_low":
      return sorted.sort(
        (a, b) => (a.hourlyRate ?? 0) - (b.hourlyRate ?? 0)
      );
    case "most_recent":
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
}

function exportApplicationsCsv(applications: WorkerApplication[]) {
  const headers = [
    "Job Title",
    "Company",
    "Status",
    "Date Sent",
    "Hourly Rate",
    "Match Score",
  ];
  const rows = applications.map((app) => [
    app.jobTitle,
    app.companyName,
    app.status,
    new Date(app.createdAt).toISOString(),
    app.hourlyRate?.toString() ?? "",
    app.matchScore.toString(),
  ]);
  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "my-applications.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function ApplicationsClient({
  applications,
  stats,
}: ApplicationsClientProps) {
  const [dateFilter, setDateFilter] = useState<ApplicationDateFilter>("anytime");
  const [statusFilters, setStatusFilters] = useState<WorkerApplicationStatus[]>(
    []
  );
  const [sortBy, setSortBy] = useState<ApplicationSortOption>("most_recent");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = applications.filter((app) =>
      matchesDateFilter(app.createdAt, dateFilter)
    );
    if (statusFilters.length > 0) {
      result = result.filter((app) => statusFilters.includes(app.status));
    }
    return sortApplications(result, sortBy);
  }, [applications, dateFilter, statusFilters, sortBy]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleStatusToggle = (status: WorkerApplicationStatus) => {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
    setVisibleCount(PAGE_SIZE);
  };

  const handleClearAll = () => {
    setDateFilter("anytime");
    setStatusFilters([]);
    setSortBy("most_recent");
    setVisibleCount(PAGE_SIZE);
  };

  const interviewBadge =
    stats.interviewsScheduled > 0
      ? `${stats.interviewsScheduled} active`
      : "None scheduled";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Applications
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-500 font-medium">
            Track your sent proposals and interview statuses.
          </p>
        </div>
        <button
          type="button"
          onClick={() => exportApplicationsCsv(filtered)}
          disabled={filtered.length === 0}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Download className="h-4 w-4" aria-hidden />
          Export List
        </button>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8">
        <ApplicationStatCard
          label="Total Sent"
          value={stats.totalSent}
          badge={
            stats.sentThisWeek > 0
              ? `+${stats.sentThisWeek} this week`
              : "No new this week"
          }
          badgeIcon={TrendingUp}
          variant="default"
          watermarkIcon={FileText}
        />
        <ApplicationStatCard
          label="Under Review"
          value={stats.underReview}
          badge="Awaiting response"
          variant="review"
          watermarkIcon={Hourglass}
        />
        <ApplicationStatCard
          label="Interviews Scheduled"
          value={stats.interviewsScheduled}
          badge={interviewBadge}
          variant="interview"
          watermarkIcon={CalendarDays}
        />
      </section>

      <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6">
        <ApplicationFilterSidebar
          dateFilter={dateFilter}
          onDateFilterChange={(value) => {
            setDateFilter(value);
            setVisibleCount(PAGE_SIZE);
          }}
          statusFilters={statusFilters}
          onStatusToggle={handleStatusToggle}
          onClearAll={handleClearAll}
          mobileOpen={mobileFiltersOpen}
          onMobileClose={() => setMobileFiltersOpen(false)}
        />

        <section className="min-w-0 mt-6 lg:mt-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg cursor-pointer"
              >
                <Filter className="h-4 w-4" aria-hidden />
                Filters
              </button>
              <p className="text-sm font-medium text-slate-600">
                Showing{" "}
                <span className="font-bold text-slate-900">
                  {filtered.length}
                </span>{" "}
                application{filtered.length === 1 ? "" : "s"}
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <span className="font-medium shrink-0">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as ApplicationSortOption);
                  setVisibleCount(PAGE_SIZE);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#006e2f] cursor-pointer"
              >
                <option value="most_recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="status">Status</option>
                <option value="rate_high">Rate: High to Low</option>
                <option value="rate_low">Rate: Low to High</option>
              </select>
            </label>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-6 w-6" />}
              title="No applications sent yet"
              description="When you apply to jobs, your proposals will appear here with live status updates from employers."
              actionLabel="Browse Jobs"
              actionHref="/worker/jobs"
            />
          ) : (
            <>
              <ul className="space-y-3">
                {visible.map((application) => (
                  <li key={application.id}>
                    <ApplicationRow application={application} />
                  </li>
                ))}
              </ul>

              {hasMore && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-[#006e2f] hover:text-[#006e2f] transition-colors cursor-pointer"
                  >
                    Load More Applications
                    <ChevronDown className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
