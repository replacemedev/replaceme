# Observability & CSP rollout

**Last updated:** 2026-07-14

## Health / uptime

- Endpoint: `GET /api/health`
- Returns `200` with `{ status: "ok" | "degraded", checks, maintenance }`
- Point Better Uptime / Checkly / Vercel monitors at production URL
- Alert on non-200 or `status: "degraded"` for >2 consecutive checks

## Sentry

Env (Vercel Production + Preview):

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SENTRY_DSN` | For client + shared | Leave unset to disable SDK |
| `SENTRY_DSN` | Optional server-only | Falls back to public DSN |
| `SENTRY_ORG` / `SENTRY_PROJECT` | Source maps | Used by `withSentryConfig` |
| `SENTRY_AUTH_TOKEN` | CI upload | Without it, maps upload is skipped |
| `SENTRY_ENVIRONMENT` | Optional | Defaults to `VERCEL_ENV` |

Tunnel: `/monitoring` (avoids ad blockers). Errors from `error.tsx` / `global-error.tsx` call `Sentry.captureException`.

## Maintenance / flags

| Variable | Effect |
|----------|--------|
| `MAINTENANCE_MODE=1` | Proxy redirects HTML to `/maintenance`; webhooks, cron, health, CSP report stay up |
| `FEATURE_<NAME>=1` | `isFeatureEnabled("name")` in `src/lib/security/feature-flags.ts` |

## CSP nonce rollout

| Variable | Effect |
|----------|--------|
| (default) | Enforce = allowlist CSP (no `unsafe-eval` in prod). Report-Only = nonce + `strict-dynamic` |
| `CSP_REPORT_ONLY=0` | Disable report-only header |
| `CSP_ENFORCE_NONCE=1` | Flip enforce to nonce/`strict-dynamic` (only after report-only is clean) |
| `CSP_REPORT_URI` | Default `/api/csp-report` |

Reports are logged via `safeWarn` (wire to Sentry later if volume warrants).

### Flip procedure

1. Monitor `/api/csp-report` + browser console for 1–2 weeks in staging then prod report-only.
2. Fix legitimate violations (missing nonces, third-party hosts).
3. Set `CSP_ENFORCE_NONCE=1` on preview → smoke Stripe + Turnstile + consent banner.
4. Promote to production; keep report-only on for a soak period.
