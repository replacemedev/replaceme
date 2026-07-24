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
  employerInterviews: (employerId: string) =>
    `rm:${CACHE_VERSION}:employer:${employerId}:interviews`,
  employerHired: (employerId: string) =>
    `rm:${CACHE_VERSION}:employer:${employerId}:hired`,
  employerPinned: (employerId: string) =>
    `rm:${CACHE_VERSION}:employer:${employerId}:pinned`,
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
  workerInterviews: (workerId: string) =>
    `rm:${CACHE_VERSION}:worker:${workerId}:interviews`,
  workerEarnings: (workerId: string) =>
    `rm:${CACHE_VERSION}:worker:${workerId}:earnings`,
  adminPlatformMetrics: () =>
    `rm:${CACHE_VERSION}:admin:platform-metrics`,
  adminRecentAuditLogs: (limit: number) =>
    `rm:${CACHE_VERSION}:admin:audit-logs:${limit}`,
  adminReportsList: (filterKey: string) =>
    `rm:${CACHE_VERSION}:admin:reports:${filterKey}`,
  messagingMessages: (userId: string, threadId: string) =>
    `rm:${CACHE_VERSION}:user:${userId}:messages:${threadId}`,
  /** Reuse signed Storage URLs so Smart CDN stays warm (unique tokens = cache miss). */
  storageSignedUrl: (bucket: string, path: string) =>
    `rm:${CACHE_VERSION}:storage:signed:${bucket}:${path}`,
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
  employerHiring: 45,
  workerInterviews: 45,
  workerEarnings: 120,
  adminMetrics: 30,
  adminAuditLogs: 30,
  adminReports: 20,
  /** Keep under signed URL expiry (typically 300–3600s). */
  storageSignedUrl: 240,
} as const;

export function employerCacheKeys(employerId: string): string[] {
  return [
    CacheKeys.employerEntitlements(employerId),
    CacheKeys.employerPlanUsage(employerId),
    CacheKeys.employerRecentJobs(employerId),
    CacheKeys.employerRecentApplicants(employerId),
    CacheKeys.employerMessagingThreads(employerId),
    CacheKeys.employerInterviews(employerId),
    CacheKeys.employerHired(employerId),
    CacheKeys.employerPinned(employerId),
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
    CacheKeys.workerInterviews(workerId),
    CacheKeys.workerEarnings(workerId),
  ];
}

export function adminCacheKeys(): string[] {
  return [
    CacheKeys.adminPlatformMetrics(),
    CacheKeys.adminRecentAuditLogs(10),
    CacheKeys.adminRecentAuditLogs(25),
    CacheKeys.adminRecentAuditLogs(50),
    CacheKeys.adminReportsList("all"),
  ];
}
