# Security Hardening Gate Checklist

**Purpose:** Mandatory release gate before production.  
**Audited:** 2026-07-10  
**Hardened:** 2026-07-10  
**Repo:** `01_replace_me` (Replaceme — Next.js + Supabase)

## Legend

| Mark | Status | Meaning |
|------|--------|---------|
| `[x]` | **Full** | Implemented and verified in code |
| `[~]` | **Partial** | Present but incomplete, weak, or fail-open |
| `[ ]` | **Not yet** | Missing or no evidence in repo |

---

## Scorecard (gate items only)

| Category | Full | Partial | Not yet |
|----------|------|---------|---------|
| Authentication | 5 | 0 | 0 |
| Authorization | 4 | 0 | 0 |
| Input Validation | 4 | 0 | 0 |
| API Security | 5 | 0 | 0 |
| Secrets | 4 | 0 | 0 |
| Dependencies | 3 | 0 | 0 |
| Headers | 4 | 0 | 0 |
| **Total** | **29** | **0** | **0** |

**Gate verdict:** Security Hardening Gate (sections 1–7) is **PASS**. Continue production-ready extras below for global launch maturity.

---

## 1. Authentication

- [x] **Supabase Auth** — Full  
  - Browser/server clients: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`  
  - Flows: `src/actions/auth.ts`  
  - Session middleware: `src/lib/server/auth/middleware.ts` (via `src/proxy.ts`)

- [x] **PKCE** — Full  
  - Code exchange: `src/app/auth/callback/route.ts` (`exchangeCodeForSession`)  
  - `@supabase/ssr` uses PKCE by default

- [x] **Session expiration** — Full  
  - Supabase JWT refresh via `getUser()` on matched requests  
  - App idle timeout: `rm_last_active` cookie — 7 days (users), 12 hours (admins)  
  - Policy: `src/lib/security/session-idle.ts`; enforced in auth middleware

- [x] **Password reset** — Full  
  - `sendPasswordResetLink` / `updatePassword` in `src/actions/auth.ts`  
  - UI: `ForgotPasswordForm`, `UpdatePasswordForm`  
  - Rate-limited (password-reset bucket) + Turnstile Siteverify

- [x] **Email verification** — Full  
  - Signup `emailRedirectTo`; login blocks unconfirmed users  
  - Confirm route: `src/app/auth/confirm/route.ts`

---

## 2. Authorization

- [x] **RLS on every table** — Full  
  - RLS enabled across migrations under `supabase/migrations/`  
  - Automated check: `npm run check:rls` (`scripts/check-rls.mjs`) — verifies all tables in `src/types/database.ts`  
  - CI: `.github/workflows/security.yml`

- [x] **Role verification** — Full  
  - `requireAuth` / `requireRole` in `src/lib/server/auth/session.ts`  
  - Middleware role routing for admin / worker / employer paths

- [x] **Admin permissions** — Full  
  - `requireAdmin`, `requireSuperAdmin`  
  - Superadmin RLS migration: `20260703120000_admin_team_superadmin.sql`  
  - Admin AAL2 gate in `src/app/admin/(shell)/layout.tsx`

- [x] **Tenant isolation** — Full  
  - RLS scoped by `auth.uid()` / `employer_id`  
  - Server actions filter by authenticated profile  
  - Client writes to billing/subscription blocked via DB triggers where applicable

---

## 3. Input Validation

- [x] **Zod validation** — Full  
  - Schemas under `src/lib/validations/`  
  - Server actions use `safeParse` / `parse` at boundaries

- [x] **File validation** — Full  
  - MIME + size checks (e.g. verification, profile image, report evidence)  
  - Storage bucket `allowed_mime_types` + `file_size_limit` in migrations  
  - Server Actions body limit `6mb` in `next.config.ts`

- [x] **SQL injection prevention** — Full  
  - DB access via Supabase/PostgREST (parameterized)  
  - Sensitive RPCs locked to `service_role` where required

- [x] **XSS prevention** — Full  
  - React default escaping; JsonLd escapes before inject  
  - CMS HTML sanitized via allowlist: `src/lib/security/sanitize-html.ts` → `CmsHtmlContent`  
  - CSP: production drops `'unsafe-eval'`; Stripe/Turnstile allowlisted (`next.config.ts`)

---

## 4. API Security

- [x] **Rate limiting** — Full  
  - Upstash Redis: `src/lib/server/rate-limit.ts`  
  - Applied to: **signin**, signup, password-reset, job apply, messaging, reports  
  - Production **fail-closed** when Redis unset (`RATE_LIMIT_FAIL_CLOSED=1` for non-prod)

- [x] **Turnstile** — Full  
  - Widget on login / signup / forgot-password  
  - Server Siteverify: `src/lib/turnstile/verify.ts` → Cloudflare `siteverify` with `TURNSTILE_SECRET_KEY`  
  - Token still passed to Supabase as `captchaToken` (defense in depth)

- [x] **CORS review** — Full  
  - No permissive custom CORS in app  
  - API surface is narrow (Stripe/Resend webhooks + cron) — server-to-server by design

- [x] **CSRF protection (where applicable)** — Full  
  - Next.js Server Actions Origin checks (framework default)  
  - Cron uses Bearer `CRON_SECRET`; webhooks use signatures  
  - Documented intentional model: `docs/secret-rotation.md` (CSRF section)

- [x] **Webhook signature verification** — Full  
  - Stripe: `constructEvent` + idempotency  
  - Resend: Svix `resend.webhooks.verify`

---

## 5. Secrets

- [x] **No API keys in frontend** — Full  
  - Only intended public keys via `NEXT_PUBLIC_*` (Supabase anon, Stripe publishable, Turnstile site key, site URL)

- [x] **Environment variables only** — Full  
  - Secrets from `process.env` on server  
  - Root template: `.env.example`

- [x] **Service role key never exposed** — Full  
  - `SUPABASE_SERVICE_ROLE_KEY` only in `createAdminClient()` (`src/lib/supabase/server.ts`)  
  - No `NEXT_PUBLIC_*SERVICE*` pattern found

- [x] **Rotate secrets if needed** — Full  
  - Runbook: `docs/secret-rotation.md` (cadence, steps, production must-haves)

---

## 6. Dependencies

- [x] **Audit packages** — Full  
  - `npm run audit` (`npm audit --audit-level=high`)  
  - CI: `.github/workflows/security.yml`

- [x] **Update vulnerable libraries** — Full  
  - Dependabot weekly: `.github/dependabot.yml`  
  - Remediation: `npm run audit:fix` + Dependabot PRs

- [x] **Remove unused packages** — Full  
  - Removed unused `autoskills` dependency

---

## 7. Headers

- [x] **CSP** — Full  
  - Set in `next.config.ts` for all routes  
  - Production: no `'unsafe-eval'`; Stripe + Turnstile + Supabase allowlisted  
  - `frame-ancestors 'self'`, `upgrade-insecure-requests`  
  - Note: nonce/`strict-dynamic` CSP deferred (static + Stripe); sanitize + CSP allowlist is the shipped control

- [x] **HSTS** — Full  
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` in `next.config.ts`

- [x] **X-Frame-Options** — Full  
  - `SAMEORIGIN` in `next.config.ts`

- [x] **X-Content-Type-Options** — Full  
  - `nosniff` in `next.config.ts`

**Also present (bonus):** `Referrer-Policy`, `Permissions-Policy`, `X-DNS-Prefetch-Control`

---

# Production-ready extras (global deploy)

Items **not** on the original gate image, but required (or strongly recommended) for a full-scale, worldwide production system.

## A. Identity & account security

- [~] **MFA for admins** — Partial *(deferred — not in this hardening pass)*  
  - AAL2 challenge enforced for admin shell when enrolled  
  - Security page shows enrollment status  
  - **Gap:** No in-app MFA enrollment UX; workers/employers have no MFA requirement

- [ ] **MFA for high-risk employer accounts** — Not yet *(deferred)*  
- [x] **Account lockout / progressive delay after failed logins** — Full  
  - Cognito/OWASP-style: after 5 failures, lock `min(2^(n-5), 900)` seconds  
  - Silent (same generic error — no enumeration)  
  - Redis-backed; in-memory fallback in non-prod  
  - Policy: `src/lib/security/login-lockout-policy.ts` · Store: `src/lib/server/login-lockout.ts` · Wired in `signIn`  
  - Test: `npx tsx scripts/test-login-lockout.mjs`
- [x] **Session revocation UI / “sign out all devices”** — Full  
  - `revokeOtherSessions` (`scope: 'others'`) + `revokeAllSessionsAndSignOut` (`scope: 'global'`)  
  - Shared UI: `SessionSecurityPanel`  
  - Pages: `/worker/settings/security`, `/employer/settings/security`, admin Security Center  
  - Normal logout uses `scope: 'local'`; password reset uses `global`  
  - Test: `node scripts/test-session-security.mjs`
- [x] **Generic login error messages** — Full (reduces user enumeration on password failure)

## B. Observability, abuse & incident response

- [~] **Audit logging** — Partial  
  - `audit_logs` table + some admin/worker event writers  
  - **Gap:** Not comprehensive across all sensitive mutations

- [ ] **Centralized error monitoring (Sentry / equivalent)** — Not yet  
- [ ] **Uptime / health endpoint + alerting** — Not yet (`/api/health` not found)
- [ ] **Security incident runbook (who/what/when)** — Not yet  
- [ ] **Abuse reporting ops SLAs** — Partial product feature exists; ops process not documented here
- [x] **Log redaction helpers** — Full (`src/utils/logger.ts` safe logging)

## C. Supply chain & CI/CD

- [ ] **CI pipeline (lint, typecheck, build, e2e)** — Not yet (no `.github/workflows`)
- [ ] **SAST (CodeQL / Semgrep / eslint-plugin-security)** — Not yet  
- [ ] **Dependency scanning in CI (`npm audit` / OSV)** — Not yet  
- [ ] **Secret scanning (gitleaks / GitHub secret scanning)** — Not yet  
- [ ] **Protected production branch + required reviews** — Ops (verify on GitHub; not in repo)
- [ ] **Signed / immutable deploy provenance** — Not yet

## D. Infrastructure & platform hardening

- [ ] **Confirm HSTS at CDN/edge** — Not yet (verify live headers)
- [ ] **WAF / bot protection at edge (Cloudflare / Vercel BotID)** — Not yet in app config
- [ ] **Rate-limit fail-closed or hard fail in production** — Not yet (currently fail-open without Redis)
- [ ] **Redis required in production env checklist** — Not yet
- [ ] **Separate staging vs production projects/keys** — Ops (document)
- [ ] **Database backups + restore drill** — Ops (Supabase; document RPO/RTO)
- [ ] **Point-in-time recovery tested** — Ops

## E. Data protection & compliance (global)

- [x] **Cookie consent + preferences storage** — Full (UI + RLS tables)
- [x] **Privacy / Terms pages** — Full (public legal content)
- [~] **GDPR / data subject requests (export / delete)** — Partial at best  
  - Legal copy exists; **Gap:** no clear self-serve data export/delete product flow verified in this audit
- [ ] **Data residency / region strategy documented** — Not yet  
- [ ] **PII inventory & retention policy** — Not yet  
- [ ] **DPA with processors (Supabase, Stripe, Resend, Upstash)** — Ops/legal
- [ ] **Subprocessor list published** — Not yet

## F. Application resilience & UX safety

- [~] **Route-level error boundaries** — Partial (`error.tsx` for admin/employer/worker; verify public routes)
- [ ] **Global `error.tsx` / `global-error.tsx`** — Verify / add if missing for public shell
- [ ] **Maintenance mode / feature flags** — Not yet
- [ ] **Idempotent critical writes beyond Stripe webhooks** — Partial (Stripe covered; review others)
- [x] **Webhook idempotency (Stripe)** — Full

## G. Content & XSS hardening (beyond gate)

- [x] **Sanitize CMS HTML (server-side allowlist; no jsdom)** — `sanitizeCmsHtml` (BUG-003: do not use isomorphic-dompurify on Vercel)  
- [ ] **Strict CSP with nonces (remove `unsafe-eval`)** — Not yet  
- [ ] **CSP report-only → enforce rollout** — Not yet

## H. Global product readiness (security-adjacent)

- [ ] **i18n / locale strategy** — Not yet (English-first product; document if intentional)
- [ ] **Timezone-safe scheduling for cron digests** — Verify cron + user prefs
- [ ] **Multi-region latency / CDN for static assets** — Platform (Vercel); document
- [ ] **Status page for outages** — Not yet
- [ ] **On-call / escalation contacts** — Ops
- [ ] **Load / soak testing before launch** — Not yet
- [ ] **Penetration test / external security review** — Not yet
- [ ] **Bug bounty or responsible disclosure policy** — Not yet

## I. Secrets & env ops

- [ ] **Root `.env.example` for this app** — Not yet  
- [ ] **Secret rotation schedule (Stripe, Supabase service role, Resend, cron, webhooks)** — Not yet  
- [ ] **Break-glass admin access procedure** — Not yet  
- [ ] **Remove unused dependency `autoskills`** — Not yet

---

# Priority backlog

## Gate items (sections 1–7) — done 2026-07-10

1. **[x]** Rate limit `signIn()` (IP + email)  
2. **[x]** Fail-closed rate limits in production without Redis  
3. **[x]** HSTS in `next.config.ts`  
4. **[x]** Sanitize CMS HTML + drop production `unsafe-eval`  
5. **[x]** Turnstile Cloudflare Siteverify (`TURNSTILE_SECRET_KEY`)  
6. **[x]** `npm audit` + CI + Dependabot  
7. **[x]** `.env.example` + `docs/secret-rotation.md`  
8. **[x]** Removed unused `autoskills`  
9. **[x]** `npm run check:rls` in CI  

## Still open (production-ready extras)

10. **[ ]** Error monitoring + health check + incident runbook  
11. **[ ]** In-app admin MFA enrollment; decide MFA policy for employers *(deferred)*  
12. **[ ]** Data export/delete flows for compliance readiness  
13. **[ ]** Nonce / `strict-dynamic` CSP via `proxy.ts` (optional hardening)  
14. **[ ]** Resolve Next.js nested `postcss` moderate advisory when upstream ships fix  
15. **[x]** Progressive login lockout (2026-07-10)  
16. **[x]** Session revocation UI — sign out others / everywhere (2026-07-10)

---

# Sign-off

| Role | Name | Date | Gate pass? |
|------|------|------|------------|
| Engineering | | | ☐ Yes ☐ No |
| Security / Tech lead | | | ☐ Yes ☐ No |
| Ops / Platform | | | ☐ Yes ☐ No |

**Rule:** Do not ship to production until every original gate item is `[x]` Full, or an explicit accepted risk is recorded for each remaining `[~]` / `[ ]` with owner + due date.

---

## Evidence index (quick links)

| Area | Primary paths |
|------|----------------|
| Auth actions | `src/actions/auth.ts` |
| Session middleware | `src/lib/server/auth/middleware.ts` |
| Idle session | `src/lib/security/session-idle.ts` |
| Rate limit | `src/lib/server/rate-limit.ts` |
| Turnstile Siteverify | `src/lib/turnstile/verify.ts` |
| HTML sanitize | `src/lib/security/sanitize-html.ts` |
| Security headers | `next.config.ts` |
| Env template | `.env.example` |
| Secret rotation | `docs/secret-rotation.md` |
| RLS CI check | `scripts/check-rls.mjs` |
| CI / Dependabot | `.github/workflows/security.yml`, `.github/dependabot.yml` |
| Admin MFA | `src/app/admin/(shell)/layout.tsx`, `src/app/admin/mfa-challenge/` |
| CMS render | `src/components/shared/cms/CmsHtmlContent.tsx` |
| Webhooks | `src/app/api/webhooks/stripe/`, `src/app/api/webhooks/resend/` |
| RLS migrations | `supabase/migrations/` |
| Service role | `src/lib/supabase/server.ts` (`createAdminClient`) |
