import { Redis } from "@upstash/redis";

let client: Redis | null = null;

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
