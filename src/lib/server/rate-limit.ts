import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { getRedis, isRedisConfigured } from "@/lib/server/redis";

export type RateLimitResult =
  | { success: true }
  | { success: false; error: string; retryAfterSeconds?: number };

type AssertRateLimitOptions = {
  maxAttempts: number;
  windowMs: number;
  identifier?: string;
};

const limiterCache = new Map<string, Ratelimit>();

function msToWindow(windowMs: number): `${number} s` | `${number} m` | `${number} h` {
  if (windowMs % (60 * 60 * 1000) === 0) {
    return `${windowMs / (60 * 60 * 1000)} h`;
  }
  if (windowMs % (60 * 1000) === 0) {
    return `${windowMs / (60 * 1000)} m`;
  }
  return `${Math.ceil(windowMs / 1000)} s`;
}

function getLimiter(
  prefix: string,
  requests: number,
  windowMs: number
): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  const window = msToWindow(windowMs);
  const cacheKey = `${prefix}:${requests}:${window}`;
  const cached = limiterCache.get(cacheKey);
  if (cached) return cached;

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `rm:ratelimit:${prefix}`,
    analytics: true,
  });
  limiterCache.set(cacheKey, limiter);
  return limiter;
}

function createLimiter(
  prefix: string,
  requests: number,
  window: `${number} ${"s" | "m" | "h" | "d"}`
): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `rm:ratelimit:${prefix}`,
    analytics: true,
  });
}

export async function assertRateLimit(
  prefix: string,
  options: AssertRateLimitOptions
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isRedisConfigured()) {
    return { ok: true };
  }

  const limiter = getLimiter(prefix, options.maxAttempts, options.windowMs);
  if (!limiter) {
    return { ok: true };
  }

  let identifier = options.identifier;
  if (!identifier) {
    const headerStore = await headers();
    identifier =
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerStore.get("x-real-ip") ??
      "anonymous";
  }

  const { success, reset } = await limiter.limit(identifier);
  if (success) {
    return { ok: true };
  }

  const retryMinutes = Math.max(
    1,
    Math.ceil((reset - Date.now()) / 1000 / 60)
  );

  return {
    ok: false,
    error: `Too many attempts. Please try again in ${retryMinutes} minutes.`,
  };
}

const applyLimiter = createLimiter("job-apply", 10, "1 h");
const messageLimiter = createLimiter("messaging", 60, "1 h");

export async function rateLimitJobApplication(
  workerId: string
): Promise<RateLimitResult> {
  if (!isRedisConfigured() || !applyLimiter) {
    return { success: true };
  }

  const { success, reset } = await applyLimiter.limit(`apply:${workerId}`);
  if (success) return { success: true };

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((reset - Date.now()) / 1000)
  );

  return {
    success: false,
    error: `Too many applications. Please try again in ${Math.ceil(retryAfterSeconds / 60)} minutes.`,
    retryAfterSeconds,
  };
}

export async function rateLimitMessaging(
  profileId: string
): Promise<RateLimitResult> {
  if (!isRedisConfigured() || !messageLimiter) {
    return { success: true };
  }

  const { success, reset } = await messageLimiter.limit(`msg:${profileId}`);
  if (success) return { success: true };

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((reset - Date.now()) / 1000)
  );

  return {
    success: false,
    error: `Message limit reached. Please wait ${Math.ceil(retryAfterSeconds / 60)} minutes before sending more.`,
    retryAfterSeconds,
  };
}
