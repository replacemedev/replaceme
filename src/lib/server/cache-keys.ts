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
  notificationsBootstrap: (userId: string) =>
    `rm:${CACHE_VERSION}:user:${userId}:notifications`,
  workerProfile: (workerId: string) =>
    `rm:${CACHE_VERSION}:worker:${workerId}:profile-summary`,
} as const;

export const CACHE_TTL_SECONDS = {
  entitlements: 60,
  planUsage: 60,
  notifications: 30,
  workerProfile: 120,
} as const;

export function employerCacheKeys(employerId: string): string[] {
  return [
    CacheKeys.employerEntitlements(employerId),
    CacheKeys.employerPlanUsage(employerId),
  ];
}
