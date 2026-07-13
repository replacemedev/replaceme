import { getRedis, isRedisConfigured, runRedis } from "@/lib/server/redis";
import {
  LOCKOUT_COUNTER_TTL_SECONDS,
  failuresKey,
  lockedUntilKey,
  lockoutSecondsForFailures,
  normalizeLockoutAccountKey,
} from "@/lib/security/login-lockout-policy";

export {
  lockoutSecondsForFailures,
  normalizeLockoutAccountKey,
} from "@/lib/security/login-lockout-policy";

type MemoryEntry = { failures: number; lockedUntilMs: number };

/** Dev fallback when Redis is unset (not shared across instances). */
const memoryStore = new Map<string, MemoryEntry>();

function mustEnforce(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.RATE_LIMIT_FAIL_CLOSED === "1"
  );
}

/**
 * Returns true if login should be blocked (still use generic error to client).
 */
export async function isLoginLocked(accountKey: string): Promise<boolean> {
  const key = normalizeLockoutAccountKey(accountKey);
  const redis = getRedis();

  if (redis) {
    const until = await runRedis(
      () => redis.get<number | string>(lockedUntilKey(key)),
      null
    );
    if (until == null) return false;
    const untilMs = typeof until === "number" ? until : Number(until);
    return Number.isFinite(untilMs) && untilMs > Date.now();
  }

  if (!isRedisConfigured() && mustEnforce()) {
    // Fail closed on auth abuse path in production without Redis
    return true;
  }

  const entry = memoryStore.get(key);
  return Boolean(entry && entry.lockedUntilMs > Date.now());
}

/** Record a failed password attempt; may set/extend lockout. */
export async function recordLoginFailure(accountKey: string): Promise<void> {
  const key = normalizeLockoutAccountKey(accountKey);
  const redis = getRedis();

  if (redis) {
    const failures = await runRedis(async () => {
      const failKey = failuresKey(key);
      const count = await redis.incr(failKey);
      if (count === 1) {
        await redis.expire(failKey, LOCKOUT_COUNTER_TTL_SECONDS);
      }
      const lockSeconds = lockoutSecondsForFailures(count);
      if (lockSeconds > 0) {
        const until = Date.now() + lockSeconds * 1000;
        await redis.set(lockedUntilKey(key), until, { ex: lockSeconds });
      }
      return count;
    }, null);
    if (failures == null) return;
    return;
  }

  if (!isRedisConfigured() && mustEnforce()) return;

  const prev = memoryStore.get(key) ?? { failures: 0, lockedUntilMs: 0 };
  const failures = prev.failures + 1;
  const lockSeconds = lockoutSecondsForFailures(failures);
  memoryStore.set(key, {
    failures,
    lockedUntilMs:
      lockSeconds > 0 ? Date.now() + lockSeconds * 1000 : prev.lockedUntilMs,
  });
}

/** Clear failure counter + lock on successful login. */
export async function clearLoginFailures(accountKey: string): Promise<void> {
  const key = normalizeLockoutAccountKey(accountKey);
  const redis = getRedis();

  if (redis) {
    await runRedis(
      () => redis.del(failuresKey(key), lockedUntilKey(key)),
      null
    );
    return;
  }

  memoryStore.delete(key);
}

/** Test helper — reset in-memory store. */
export function __resetLoginLockoutMemoryForTests(): void {
  memoryStore.clear();
}
