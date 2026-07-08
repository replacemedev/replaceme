/**
 * Single source of truth for application status across Worker and Employer domains.
 * Persisted on public.applications.status (PostgreSQL enum application_status).
 */
export const APPLICATION_STATUSES = [
  "PENDING",
  "UNDER_REVIEW",
  "INTERVIEW_SCHEDULED",
  "REJECTED",
  "HIRED",
  "WITHDRAWN",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export function isApplicationStatus(value: string): value is ApplicationStatus {
  return (APPLICATION_STATUSES as readonly string[]).includes(value);
}

/** Human-readable labels for employer UI controls. */
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  INTERVIEW_SCHEDULED: "Interviewing",
  REJECTED: "Rejected",
  HIRED: "Hired",
  WITHDRAWN: "Withdrawn",
};

export type ApplicationSortOption =
  | "most_recent"
  | "oldest"
  | "status"
  | "rate_high"
  | "rate_low";

export type ApplicationDateFilter =
  | "anytime"
  | "last_7_days"
  | "last_30_days"
  | "last_90_days";

/** Aggregated stats for the three top cards — computed from real rows. */
export interface WorkerApplicationStats {
  totalSent: number;
  sentThisWeek: number;
  underReview: number;
  interviewsScheduled: number;
}

/** Single application row with joined job + company context. */
export interface WorkerApplication {
  id: string;
  jobId: string;
  status: ApplicationStatus;
  createdAt: string;
  matchScore: number;
  jobTitle: string;
  companyName: string;
  companyLogoUrl: string | null;
  monthlySalary: number;
  hoursPerWeek: number;
  hourlyRate: number | null;
  salaryCurrency?: string;
}

export function computeHourlyRate(
  monthlySalary: number,
  hoursPerWeek: number
): number | null {
  if (!monthlySalary || !hoursPerWeek) return null;
  const monthlyHours = hoursPerWeek * 4;
  return Math.round(monthlySalary / monthlyHours);
}

import { formatMoney } from "@/lib/format/currency";

export function formatHourlyRate(
  rate: number | null,
  currency: string = "PHP"
): string {
  if (rate == null) return "Rate TBD";
  return formatMoney(rate, currency, { perHour: true });
}

export type StatusBadgeVariant =
  | "review"
  | "interview"
  | "shortlisted"
  | "declined"
  | "hired"
  | "default";

export function getStatusBadge(
  status: ApplicationStatus
): { label: string; variant: StatusBadgeVariant } {
  switch (status) {
    case "INTERVIEW_SCHEDULED":
      return { label: "Interview Scheduled", variant: "interview" };
    case "UNDER_REVIEW":
      return { label: "Under Review", variant: "shortlisted" };
    case "REJECTED":
      return { label: "Declined", variant: "declined" };
    case "HIRED":
      return { label: "Hired", variant: "hired" };
    case "WITHDRAWN":
      return { label: "Withdrawn", variant: "declined" };
    case "PENDING":
    default:
      return { label: "Under Review", variant: "review" };
  }
}

export const UNDER_REVIEW_STATUSES: ApplicationStatus[] = [
  "PENDING",
  "UNDER_REVIEW",
];

export const APPLICATION_STATUS_FILTERS: {
  value: ApplicationStatus;
  label: string;
}[] = APPLICATION_STATUSES.map((value) => ({
  value,
  label: APPLICATION_STATUS_LABELS[value],
}));

/** @deprecated Use ApplicationStatus */
export type WorkerApplicationStatus = ApplicationStatus;
