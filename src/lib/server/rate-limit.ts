import { headers } from "next/headers";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export async function getRequestClientKey(): Promise<string> {
  const headerStore = await headers();
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown"
  );
}

export async function assertRateLimit(
  scope: string,
  options: { maxAttempts: number; windowMs: number }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const clientKey = await getRequestClientKey();
  const bucketKey = `${scope}:${clientKey}`;
  const now = Date.now();
  const bucket = buckets.get(bucketKey);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(bucketKey, { count: 1, resetAt: now + options.windowMs });
    return { ok: true };
  }

  if (bucket.count >= options.maxAttempts) {
    return {
      ok: false,
      error: "Too many requests. Please wait a few minutes before trying again.",
    };
  }

  bucket.count += 1;
  return { ok: true };
}
