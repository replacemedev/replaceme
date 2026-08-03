import type { ApplicationStatus } from "@/types/applications";

export type WorkerStatusEmailCopy = {
  tone: "viewed" | "shortlisted" | "hired" | "declined";
  headline: string;
  body: string;
  /** Skip email for statuses that aren't employer-driven updates. */
  shouldNotify: boolean;
};

/**
 * Maps application_status enum values to worker-facing email copy.
 */
export function workerStatusEmailCopy(
  status: ApplicationStatus
): WorkerStatusEmailCopy {
  switch (status) {
    case "UNDER_REVIEW":
      return {
        tone: "shortlisted",
        headline: "You've been shortlisted!",
        body: "Great news — the employer shortlisted your application and may reach out soon.",
        shouldNotify: true,
      };
    case "HIRED":
      return {
        tone: "hired",
        headline: "Congratulations! You're hired!",
        body: "An employer hired you through Replaceme. Check your dashboard for next steps.",
        shouldNotify: true,
      };
    case "REJECTED":
      return {
        tone: "declined",
        headline: "Application update",
        body: "This application was declined. Thank you for applying. Keep exploring new roles.",
        shouldNotify: true,
      };
    case "PENDING":
    case "WITHDRAWN":
    default:
      return {
        tone: "viewed",
        headline: "",
        body: "",
        shouldNotify: false,
      };
  }
}
