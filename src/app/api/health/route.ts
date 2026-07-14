import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";

/**
 * Liveness / readiness probe for uptime monitors.
 * Always returns 200 when the process is up; `status` and checks show dependency health.
 * Does not require auth. Safe to scrape publicly (no secrets).
 */
export async function GET() {
  const started = Date.now();
  const checks: Record<string, "ok" | "degraded" | "skip"> = {
    app: "ok",
    supabase: "skip",
    redis: "skip",
  };

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = await createAdminClient();
      const { error } = await admin.from("profiles").select("id").limit(1);
      checks.supabase = error ? "degraded" : "ok";
    } catch (err) {
      safeError("/api/health supabase check:", err);
      checks.supabase = "degraded";
    }
  }

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    checks.redis = "ok";
  }

  const degraded = Object.values(checks).includes("degraded");
  const body = {
    status: degraded ? "degraded" : "ok",
    service: "replaceme",
    timestamp: new Date().toISOString(),
    latencyMs: Date.now() - started,
    checks,
    maintenance: process.env.MAINTENANCE_MODE === "1" || process.env.MAINTENANCE_MODE === "true",
  };

  return NextResponse.json(body, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
