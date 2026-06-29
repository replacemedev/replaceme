import { safeError } from "@/utils/logger";
import {
  CACHE_VERSION,
  CacheKeys,
  employerCacheKeys,
  CACHE_TTL_SECONDS,
} from "@/lib/server/cache-keys";
import { getRedis } from "@/lib/server/redis";

export { CacheKeys, CACHE_TTL_SECONDS, employerCacheKeys };

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

/** Drop all entitlement-related keys for one employer (after plan/job mutations). */
export async function invalidateEmployerCache(employerId: string): Promise<void> {
  await cacheDel(...employerCacheKeys(employerId));
}

/** Drop user-scoped keys (notifications, worker profile). */
export async function invalidateUserCache(userId: string): Promise<void> {
  await cacheDel(
    CacheKeys.notificationsBootstrap(userId),
    CacheKeys.workerProfile(userId)
  );
}

export function cacheVersion(): string {
  return CACHE_VERSION;
}
