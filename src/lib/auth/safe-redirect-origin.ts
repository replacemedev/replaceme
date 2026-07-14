import type { NextRequest } from "next/server";
import { getSiteUrl } from "@/lib/auth/site-url";

/**
 * Resolve post-auth redirect origin from an allowlist only.
 * Never trust raw `x-forwarded-host` — Host header injection can phish sessions.
 */
export function resolveSafeRedirectOrigin(request: NextRequest): string {
  const siteUrl = getSiteUrl();
  const allowedHosts = new Set<string>();

  try {
    allowedHosts.add(new URL(siteUrl).host);
  } catch {
    /* ignore invalid SITE_URL */
  }

  if (process.env.VERCEL_URL) {
    allowedHosts.add(process.env.VERCEL_URL);
  }
  if (process.env.VERCEL_BRANCH_URL) {
    allowedHosts.add(process.env.VERCEL_BRANCH_URL);
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    allowedHosts.add(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  }

  allowedHosts.add(request.nextUrl.host);

  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();

  if (forwardedHost && allowedHosts.has(forwardedHost)) {
    const proto =
      request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
      "https";
    return `${proto}://${forwardedHost}`;
  }

  if (allowedHosts.has(request.nextUrl.host)) {
    return request.nextUrl.origin;
  }

  return siteUrl;
}
