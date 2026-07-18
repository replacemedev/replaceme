import { formatMoney } from "@/lib/format/currency";

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
  salaryCurrency: string;
  hoursPerWeek: number;
  hourlyRate: number | null;
  location: string;
  skills: string[];
  createdAt: string;
  isSaved: boolean;
  priorityScore?: number;
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
  totalFilteredJobs: number;
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
  hoursPerWeek: number,
  currency: string = "PHP"
): string {
  const hourly = computeJobHourlyRate(monthlySalary, hoursPerWeek);
  if (hourly && hourly > 0) {
    return formatMoney(hourly, currency, { perHour: true }).toUpperCase();
  }
  return `${formatMoney(monthlySalary, currency)}/mo`.toUpperCase();
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
  const t = type.trim().toLowerCase();
  if (t === "full-time" || t === "fulltime") return "Full-time";
  if (t === "part-time" || t === "parttime") return "Part-time";
  if (t === "contract") return "Contract";
  return type.trim().replace(/\b\w/g, (c) => c.toUpperCase());
}

export const SALARY_SLIDER_MAX = 200_000;
