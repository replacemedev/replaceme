/** Bump when cached payload shapes change. */
export const CACHE_VERSION = "v1";

/**
 * Per-user / per-employer Redis keys. Never cache sensitive data under a shared key.
 * @see docs/pricing-migration/entitlement-matrix.md (L9 Redis entitlement cache)
 */
export const CacheKeys = {
  employerEntitlements: (employerId: string) =>
    `rm:${CACHE_VERSION}:employer:${employerId}:entitlements`,
  employerPlanUsage: (employerId: string) =>
    `rm:${CACHE_VERSION}:employer:${employerId}:plan-usage`,
  employerRecentJobs: (employerId: string) =>
    `rm:${CACHE_VERSION}:employer:${employerId}:recent-jobs`,
  employerRecentApplicants: (employerId: string) =>
    `rm:${CACHE_VERSION}:employer:${employerId}:recent-applicants`,
  employerApplicants: (employerId: string, jobId: string) =>
    `rm:${CACHE_VERSION}:employer:${employerId}:applicants:${jobId}`,
  employerMessagingThreads: (employerId: string) =>
    `rm:${CACHE_VERSION}:employer:${employerId}:messaging-threads`,
  notificationsBootstrap: (userId: string) =>
    `rm:${CACHE_VERSION}:user:${userId}:notifications`,
  workerProfile: (workerId: string) =>
    `rm:${CACHE_VERSION}:worker:${workerId}:profile-summary`,
  workerApplications: (workerId: string) =>
    `rm:${CACHE_VERSION}:worker:${workerId}:applications`,
  workerJobSearch: (workerId: string) =>
    `rm:${CACHE_VERSION}:worker:${workerId}:job-search`,
  workerSavedJobs: (workerId: string) =>
    `rm:${CACHE_VERSION}:worker:${workerId}:saved-jobs`,
  workerMessagingThreads: (workerId: string) =>
    `rm:${CACHE_VERSION}:worker:${workerId}:messaging-threads`,
  messagingMessages: (userId: string, threadId: string) =>
    `rm:${CACHE_VERSION}:user:${userId}:messages:${threadId}`,
} as const;

export const CACHE_TTL_SECONDS = {
  entitlements: 60,
  planUsage: 60,
  notifications: 30,
  workerProfile: 120,
  employerDashboard: 45,
  applicants: 30,
  messagingThreads: 20,
  messagingMessages: 15,
  workerApplications: 45,
  jobSearch: 60,
  savedJobs: 60,
} as const;

export function employerCacheKeys(employerId: string): string[] {
  return [
    CacheKeys.employerEntitlements(employerId),
    CacheKeys.employerPlanUsage(employerId),
    CacheKeys.employerRecentJobs(employerId),
    CacheKeys.employerRecentApplicants(employerId),
    CacheKeys.employerMessagingThreads(employerId),
  ];
}

export function workerCacheKeys(workerId: string): string[] {
  return [
    CacheKeys.notificationsBootstrap(workerId),
    CacheKeys.workerProfile(workerId),
    CacheKeys.workerApplications(workerId),
    CacheKeys.workerJobSearch(workerId),
    CacheKeys.workerSavedJobs(workerId),
    CacheKeys.workerMessagingThreads(workerId),
  ];
}
