import { Redis } from "@upstash/redis";
import { safeError } from "@/utils/logger";

let client: Redis | null = null;

export const REDIS_UNAVAILABLE_ERROR =
  "Security controls unavailable. Please try again later.";

export function isRedisInfrastructureError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = (error as { name?: string }).name ?? "";
  const message = String((error as { message?: string }).message ?? "");
  return (
    name === "UpstashError" ||
    message.includes("WRONGPASS") ||
    message.includes("invalid or missing auth token")
  );
}

/** Run a Redis command; on Upstash/auth failures return `onFailure` instead of throwing. */
export async function runRedis<T>(
  operation: () => Promise<T>,
  onFailure: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    safeError("[Redis] Request failed:", error);
    return onFailure;
  }
}

export function isRedisConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

/** HTTP-based Upstash client — safe for serverless / edge (no TCP pool). */
export function getRedis(): Redis | null {
  if (!isRedisConfigured()) return null;

  if (!client) {
    client = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  return client;
}
