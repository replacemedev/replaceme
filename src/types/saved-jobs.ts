import { computeJobHourlyRate } from "@/types/job-search";

export const SAVED_JOB_SORT_OPTIONS = [
  "date_saved_newest",
  "date_saved_oldest",
  "salary_high",
  "salary_low",
  "title_az",
] as const;

export type SavedJobSortOption = (typeof SAVED_JOB_SORT_OPTIONS)[number];

export const DEFAULT_SAVED_JOB_SORT: SavedJobSortOption = "date_saved_newest";

export function isSavedJobSortOption(value: string): value is SavedJobSortOption {
  return (SAVED_JOB_SORT_OPTIONS as readonly string[]).includes(value);
}

export interface SavedJob {
  savedId: string;
  savedAt: string;
  id: string;
  title: string;
  companyName: string;
  companyLogoUrl: string | null;
  employmentType: string;
  monthlySalary: number;
  hoursPerWeek: number;
  hourlyRate: number | null;
  location: string;
  status: string;
  hasApplied: boolean;
}

export interface SavedJobsQuery {
  q: string;
  sort: SavedJobSortOption;
}

export function parseSavedJobsQuery(
  searchParams: Record<string, string | string[] | undefined>
): SavedJobsQuery {
  const rawQ = searchParams.q;
  const rawSort = searchParams.sort;
  const q = (Array.isArray(rawQ) ? rawQ[0] : rawQ)?.trim() ?? "";
  const sortRaw = Array.isArray(rawSort) ? rawSort[0] : rawSort;
  const sort = sortRaw && isSavedJobSortOption(sortRaw)
    ? sortRaw
    : DEFAULT_SAVED_JOB_SORT;
  return { q, sort };
}

export function filterSavedJobs(jobs: SavedJob[], q: string): SavedJob[] {
  if (!q) return jobs;
  const needle = q.toLowerCase();
  return jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(needle) ||
      job.companyName.toLowerCase().includes(needle) ||
      job.location.toLowerCase().includes(needle) ||
      job.employmentType.toLowerCase().includes(needle)
  );
}

export function sortSavedJobs(
  jobs: SavedJob[],
  sort: SavedJobSortOption
): SavedJob[] {
  const sorted = [...jobs];
  switch (sort) {
    case "date_saved_oldest":
      return sorted.sort(
        (a, b) => new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime()
      );
    case "salary_high":
      return sorted.sort((a, b) => b.monthlySalary - a.monthlySalary);
    case "salary_low":
      return sorted.sort((a, b) => a.monthlySalary - b.monthlySalary);
    case "title_az":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "date_saved_newest":
    default:
      return sorted.sort(
        (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      );
  }
}

export const SAVED_JOB_SORT_LABELS: Record<SavedJobSortOption, string> = {
  date_saved_newest: "Date Saved (Newest)",
  date_saved_oldest: "Date Saved (Oldest)",
  salary_high: "Salary (High to Low)",
  salary_low: "Salary (Low to High)",
  title_az: "Job Title (A–Z)",
};

export function formatSavedJobSalary(monthlySalary: number, hoursPerWeek: number): string {
  const hourly = computeJobHourlyRate(monthlySalary, hoursPerWeek);
  if (hourly && hourly > 0) {
    return `$${hourly.toLocaleString("en-US")}/hr`;
  }
  return `$${Math.round(monthlySalary).toLocaleString("en-US")}/mo`;
}

export function formatEmploymentPill(type: string): string {
  return type.trim() || "Any";
}
