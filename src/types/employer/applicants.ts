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
  avatarUrl: string | null;
  email: string | null;
  bio: string | null;
  resumeUrl: string | null;
  createdAt: string;
}

export interface EmployerCreditInfo {
  employerId: string;
  creditsBalance: number;
}
