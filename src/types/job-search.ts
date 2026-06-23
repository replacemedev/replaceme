export type JobSortOption =
  | "most_relevant"
  | "newest"
  | "salary_high"
  | "salary_low";

export interface JobSearchResult {
  id: string;
  employerId: string;
  title: string;
  companyName: string;
  companyLogoUrl: string | null;
  employmentType: string;
  description: string;
  monthlySalary: number;
  hoursPerWeek: number;
  hourlyRate: number | null;
  location: string;
  skills: string[];
  createdAt: string;
  isSaved: boolean;
}

export interface EmploymentTypeFacet {
  type: string;
  count: number;
}

export interface JobSearchFacets {
  employmentTypes: EmploymentTypeFacet[];
  skillSuggestions: string[];
  salaryMin: number;
  salaryMax: number;
  totalActiveJobs: number;
}

export interface JobSearchPayload {
  jobs: JobSearchResult[];
  facets: JobSearchFacets;
  savedJobIds: string[];
}

export function computeJobHourlyRate(
  monthlySalary: number,
  hoursPerWeek: number
): number | null {
  if (!monthlySalary || !hoursPerWeek) return null;
  return Math.round(monthlySalary / (hoursPerWeek * 4));
}

export function formatSalaryBadge(
  monthlySalary: number,
  hoursPerWeek: number
): string {
  const hourly = computeJobHourlyRate(monthlySalary, hoursPerWeek);
  if (hourly && hourly > 0) {
    return `₱${hourly.toLocaleString("en-US")}/HR`;
  }
  return `₱${Math.round(monthlySalary).toLocaleString("en-US")}/MO`;
}

export function formatEmploymentBadge(type: string): string {
  return type.toUpperCase();
}

export function daysSincePosted(createdAt: string): string {
  const days = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted 1 day ago";
  return `Posted ${days} days ago`;
}

export function normalizeEmploymentType(type: string): string {
  return type.trim();
}

export const SALARY_SLIDER_MAX = 200_000;
