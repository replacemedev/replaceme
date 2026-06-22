export type ApplicantStatus = "Applied" | "Interviewing" | "Shortlisted" | "Rejected" | "Hired";

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
