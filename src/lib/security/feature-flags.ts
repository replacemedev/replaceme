/**
 * Env-backed kill switches and feature flags for resilience / staged rollout.
 *
 * Maintenance: MAINTENANCE_MODE=1|true
 * Feature flags: FEATURE_<NAME>=1|true (e.g. FEATURE_NEW_CHECKOUT=1)
 */

export function isMaintenanceMode(): boolean {
  const v = process.env.MAINTENANCE_MODE;
  return v === "1" || v === "true";
}

/** Paths that must stay reachable during maintenance (ops + inbound providers). */
export function isMaintenanceBypassPath(pathname: string): boolean {
  if (pathname === "/maintenance") return true;
  if (pathname.startsWith("/api/health")) return true;
  if (pathname.startsWith("/api/webhooks/")) return true;
  if (pathname.startsWith("/api/csp-report")) return true;
  if (pathname.startsWith("/api/cron/")) return true;
  return false;
}

export function isFeatureEnabled(flag: string): boolean {
  const key = `FEATURE_${flag.replace(/[^a-zA-Z0-9_]/g, "_").toUpperCase()}`;
  const v = process.env[key];
  return v === "1" || v === "true";
}
