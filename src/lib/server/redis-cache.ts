import { safeError } from "@/utils/logger";
import {
  CACHE_VERSION,
  CacheKeys,
  employerCacheKeys,
  workerCacheKeys,
  CACHE_TTL_SECONDS,
} from "@/lib/server/cache-keys";
import { getRedis } from "@/lib/server/redis";

export { CacheKeys, CACHE_TTL_SECONDS, employerCacheKeys, workerCacheKeys };

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;

  try {
    return (await redis.get<T>(key)) ?? null;
  } catch (err) {
    safeError(`cacheGet: ${key}`, err);
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (err) {
    safeError(`cacheSet: ${key}`, err);
  }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  const redis = getRedis();
  if (!redis || keys.length === 0) return;

  try {
    await redis.del(...keys);
  } catch (err) {
    safeError(`cacheDel: ${keys.join(",")}`, err);
  }
}

/**
 * Cache-aside: per-key TTL, falls through to fetcher on miss or Redis unavailable.
 */
export async function getOrSet<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;

  const fresh = await fetcher();
  await cacheSet(key, fresh, ttlSeconds);
  return fresh;
}

/** Drop entitlement + dashboard + messaging keys for one employer. */
export async function invalidateEmployerCache(employerId: string): Promise<void> {
  await cacheDel(...employerCacheKeys(employerId));
}

/** Drop applicant list + dashboard + hiring slices after apply or status change. */
export async function invalidateEmployerApplicantsCache(
  employerId: string,
  jobId: string
): Promise<void> {
  await cacheDel(
    CacheKeys.employerApplicants(employerId, jobId),
    CacheKeys.employerRecentJobs(employerId),
    CacheKeys.employerRecentApplicants(employerId),
    CacheKeys.employerInterviews(employerId),
    CacheKeys.employerHired(employerId)
  );
}

/** Drop interviews + hired lists (contract mutations, offers). */
export async function invalidateEmployerHiringCache(
  employerId: string
): Promise<void> {
  await cacheDel(
    CacheKeys.employerInterviews(employerId),
    CacheKeys.employerHired(employerId)
  );
}

/** Drop pinned workers list after pin/unpin. */
export async function invalidateEmployerPinnedCache(
  employerId: string
): Promise<void> {
  await cacheDel(CacheKeys.employerPinned(employerId));
}

/** Drop all worker-scoped keys (applications, search, saved jobs, messaging, profile). */
export async function invalidateWorkerCache(workerId: string): Promise<void> {
  await cacheDel(...workerCacheKeys(workerId));
}

/** Drop notifications bootstrap only (mark read / delete). */
export async function invalidateUserCache(userId: string): Promise<void> {
  await cacheDel(CacheKeys.notificationsBootstrap(userId));
}

export async function invalidateEmployerMessagingCache(
  employerId: string
): Promise<void> {
  await cacheDel(CacheKeys.employerMessagingThreads(employerId));
}

export async function invalidateWorkerMessagingCache(
  workerId: string
): Promise<void> {
  await cacheDel(
    CacheKeys.workerMessagingThreads(workerId),
    CacheKeys.workerApplications(workerId)
  );
}

export async function invalidateMessagingThreadMessages(
  userId: string,
  threadId: string
): Promise<void> {
  await cacheDel(CacheKeys.messagingMessages(userId, threadId));
}

export function cacheVersion(): string {
  return CACHE_VERSION;
}
