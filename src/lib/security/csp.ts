/**
 * CSP builders for enforce + report-only (nonce/`strict-dynamic`) rollout.
 *
 * Env:
 * - CSP_REPORT_ONLY=0 — disable report-only header (default: on in production)
 * - CSP_ENFORCE_NONCE=1 — replace allowlist enforce with nonce/`strict-dynamic` policy
 * - CSP_REPORT_URI — override report endpoint (default `/api/csp-report`)
 */

export type CspMode = "allowlist" | "nonce";

const STRIPE_SCRIPT = "https://js.stripe.com";
const TURNSTILE = "https://challenges.cloudflare.com";

export function buildCspDirectives(options: {
  mode: CspMode;
  nonce?: string;
  isDev: boolean;
  reportUri?: string;
}): string {
  const { mode, nonce, isDev, reportUri } = options;
  const reportTo = reportUri ?? "/api/csp-report";

  const scriptSrc =
    mode === "nonce" && nonce
      ? [
          "script-src",
          "'self'",
          `'nonce-${nonce}'`,
          "'strict-dynamic'",
          ...(isDev ? ["'unsafe-eval'"] : []),
          STRIPE_SCRIPT,
          TURNSTILE,
        ].join(" ")
      : [
          "script-src",
          "'self'",
          "'unsafe-inline'",
          ...(isDev ? ["'unsafe-eval'"] : []),
          STRIPE_SCRIPT,
          TURNSTILE,
        ].join(" ");

  // Styles: keep 'unsafe-inline' — CSS-in-JS / Tailwind / Material Symbols need it.
  // Nonce alone is insufficient for style attributes without a large migration.
  const directives = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com https://js.stripe.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://challenges.cloudflare.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io",
    "frame-src https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
    `report-uri ${reportTo}`,
    "report-to csp-endpoint",
  ];

  return directives.join("; ");
}

export function getEnforceCspMode(): CspMode {
  return process.env.CSP_ENFORCE_NONCE === "1" ||
    process.env.CSP_ENFORCE_NONCE === "true"
    ? "nonce"
    : "allowlist";
}

export function shouldSendReportOnlyCsp(): boolean {
  if (process.env.CSP_REPORT_ONLY === "0" || process.env.CSP_REPORT_ONLY === "false") {
    return false;
  }
  // Default on when not explicitly disabled (safe for staging + prod rollout).
  return true;
}

export function getCspReportUri(): string {
  return process.env.CSP_REPORT_URI?.trim() || "/api/csp-report";
}

export const CSP_REPORT_TO_HEADER = JSON.stringify({
  group: "csp-endpoint",
  max_age: 10886400,
  endpoints: [{ url: "/api/csp-report" }],
  include_subdomains: true,
});
