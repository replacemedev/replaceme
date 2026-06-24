/**
 * Unified marketplace type exports.
 * Import domain types from here for cross-cutting features.
 */

export type {
  ApplicationStatus,
  WorkerApplication,
  WorkerApplicationStats,
  ApplicationSortOption,
  ApplicationDateFilter,
} from "./applications";

export type {
  JobSearchResult,
  JobSearchFacets,
  JobSearchPayload,
  JobSortOption,
  EmploymentTypeFacet,
} from "./job-search";

export type {
  WorkerJobDetails,
  JobDetailsCompany,
  ParsedJobSections,
} from "./job-details";

export type {
  JobApplicationFormValues,
  ApplyJobPageData,
  ApplyJobSummary,
  ContactMethod,
} from "./job-application";

export type {
  SavedJob,
  SavedJobsQuery,
  SavedJobSortOption,
} from "./saved-jobs";

export type {
  VerificationStatus,
  WorkerVerificationState,
  VerificationDocumentType,
  VerificationDocumentRecord,
} from "./verification";

export type { WorkerProfile, WorkerSkillDetailed } from "./worker-profile";

export type { Applicant, ApplicantStatus, MatchLabel } from "./employer/applicants";

export type { PinnedWorker } from "./employer/pinned";

export type { MessagingThread, MessagingMessage, MessagingJobRole, JobRoleFilterValue } from "./messaging";

export type { NavSession, NavProfile, UserRole } from "./nav";
export { GUEST_NAV_SESSION } from "./nav";
