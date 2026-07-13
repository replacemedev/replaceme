import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import {
  getRedis,
  isRedisConfigured,
  REDIS_UNAVAILABLE_ERROR,
  runRedis,
} from "@/lib/server/redis";

export type RateLimitResult =
  | { success: true }
  | { success: false; error: string; retryAfterSeconds?: number };

type AssertRateLimitOptions = {
  maxAttempts: number;
  windowMs: number;
  identifier?: string;
};

const limiterCache = new Map<string, Ratelimit>();

const REDIS_REQUIRED_ERROR = REDIS_UNAVAILABLE_ERROR;

function mustEnforceRateLimit(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.RATE_LIMIT_FAIL_CLOSED === "1"
  );
}

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

async function resolveIdentifier(explicit?: string): Promise<string> {
  if (explicit) return explicit;
  const headerStore = await headers();
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "anonymous"
  );
}

export async function assertRateLimit(
  prefix: string,
  options: AssertRateLimitOptions
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isRedisConfigured()) {
    if (mustEnforceRateLimit()) {
      return { ok: false, error: REDIS_REQUIRED_ERROR };
    }
    return { ok: true };
  }

  const limiter = getLimiter(prefix, options.maxAttempts, options.windowMs);
  if (!limiter) {
    if (mustEnforceRateLimit()) {
      return { ok: false, error: REDIS_REQUIRED_ERROR };
    }
    return { ok: true };
  }

  const identifier = await resolveIdentifier(options.identifier);
  const result = await runRedis(
    () => limiter.limit(identifier),
    null as { success: boolean; reset: number } | null
  );

  if (!result) {
    if (mustEnforceRateLimit()) {
      return { ok: false, error: REDIS_REQUIRED_ERROR };
    }
    return { ok: true };
  }

  const { success, reset } = result;
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
const reportLimiter = createLimiter("reports", 6, "1 h");

async function limitedOrFailOpen(
  limiter: Ratelimit | null,
  key: string,
  blockedMessage: (retryAfterSeconds: number) => string
): Promise<RateLimitResult> {
  if (!isRedisConfigured() || !limiter) {
    if (mustEnforceRateLimit()) {
      return { success: false, error: REDIS_REQUIRED_ERROR };
    }
    return { success: true };
  }

  const result = await runRedis(
    () => limiter.limit(key),
    null as { success: boolean; reset: number } | null
  );

  if (!result) {
    if (mustEnforceRateLimit()) {
      return { success: false, error: REDIS_REQUIRED_ERROR };
    }
    return { success: true };
  }

  const { success, reset } = result;
  if (success) return { success: true };

  const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return {
    success: false,
    error: blockedMessage(retryAfterSeconds),
    retryAfterSeconds,
  };
}

export async function rateLimitJobApplication(
  workerId: string
): Promise<RateLimitResult> {
  return limitedOrFailOpen(
    applyLimiter,
    `apply:${workerId}`,
    (s) =>
      `Too many applications. Please try again in ${Math.ceil(s / 60)} minutes.`
  );
}

export async function rateLimitMessaging(
  profileId: string
): Promise<RateLimitResult> {
  return limitedOrFailOpen(
    messageLimiter,
    `msg:${profileId}`,
    (s) =>
      `Message limit reached. Please wait ${Math.ceil(s / 60)} minutes before sending more.`
  );
}

export async function rateLimitReportSubmission(
  profileId: string
): Promise<RateLimitResult> {
  return limitedOrFailOpen(
    reportLimiter,
    `report:${profileId}`,
    (s) =>
      `Report limit reached. Please wait ${Math.ceil(s / 60)} minutes before submitting another.`
  );
}
