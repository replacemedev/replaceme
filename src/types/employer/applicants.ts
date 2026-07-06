import type { ApplicationStatus } from "@/types/applications";

/** Alias — employer and worker share ApplicationStatus from applications.ts */
export type ApplicantStatus = ApplicationStatus;

export type MatchLabel = "high" | "mid" | "low";

export interface Applicant {
  id: string;
  jobId: string;
  candidateId: string;
  name: string;
  role: string;
  matchScore: number;
  matchLabel: MatchLabel;
  status: ApplicantStatus;
  skills: string[];
  experienceYears: number;
  isUnlocked: boolean;
  identityMode?: "full" | "anonymous_preview";
  avatarUrl: string | null;
  email: string | null;
  bio: string | null;
  resumeUrl: string | null;
  expectedSalaryMin?: number | null;
  expectedSalaryMax?: number | null;
  salaryCurrency?: string | null;
  createdAt: string;
  isVerified: boolean;
  messagingThreadId?: string | null;
  interview?: {
    id: string;
    scheduled_at: string;
    meeting_link: string | null;
    status: string;
    notes: string | null;
  } | null;
}

export interface EmployerCreditInfo {
  employerId: string;
  creditsBalance: number;
}
