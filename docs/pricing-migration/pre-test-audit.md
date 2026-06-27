# Pre-Test Audit — Pricing v2 (Layers 6T-W / 6T-E / 6T-A)

**Date:** 2026-06-26  
**Goal:** Confirm backend, database, frontend, and API wiring match the four-tier model before Playwright matrix runs.

## Canonical tiers (source of truth)

| Tier | Price | Active jobs | Applicants/job | Approval | Identity | Messaging | Resumes |
|------|-------|-------------|----------------|----------|----------|-----------|---------|
| **Discovery** | $0 | 1 | 10 | 2-day queue | Anonymous preview | — | — |
| **Starter** | $19 | 3 | 20 | Instant | Full | ✓ | ✓ |
| **Growth** ★ | $39 | 10 | 50 | Instant | Full | ✓ | ✓ + priority listing |
| **Scale** | $79 | Unlimited | Unlimited | Instant | Full | ✓ | ✓ + priority support |

---

## Database

| Area | Status | Notes |
|------|--------|-------|
| `billing_plans` four rows | ✅ | Migration `20260627120000_pricing_v2_four_tiers.sql` |
| `employer_subscriptions` + usage | ✅ | `plan_slug`, `job_posts_used`, `override_*` |
| `is_within_plan_cap` RPC | ✅ | Applicant cap enforcement |
| `get_applicant_preview` RPC | ✅ | Anonymous vs full identity |
| `entitlement_denials` | ✅ | Logging on deny |
| `interviews` + `application_stage_history` | ✅ | Layer 1B |
| E2E seed fixtures | ✅ | Gate 5V — `npm run seed:e2e:verify` |
| **Employer signup trigger** | ✅ **fixed** | `guard_employer_subscription_client_write` now allows Discovery `plan_id` during `app.provisioning_signup` — migration `20260627140000_fix_signup_discovery_plan_guard.sql` (applied remote) |

---

## Backend (server actions & entitlements)

| Gate | File | Status |
|------|------|--------|
| Job post limit | `entitlements.ts` → `jobs.ts` | ✅ |
| Applicant cap | `entitlements.ts` → `job-application.ts` | ✅ |
| Identity preview vs full | `entitlements.ts` → `applicants.ts` | ✅ |
| Resume download | `entitlements.ts` | ✅ |
| Employer messaging | `entitlements.ts` → `messaging.ts` | ✅ |
| Worker send to Discovery employer | `messaging.ts` | ✅ **fixed** — checks employer plan + `blocked_reason` for both roles |
| Job approval mode / priority score | `jobs.ts` | ✅ |
| Pin / review soft gates | `pinned.ts`, `reviews.ts` | ✅ |
| Stripe checkout / portal / webhook | `billing.ts`, `stripe/*`, `webhooks/stripe` | ✅ |
| Admin subscription list + override | `admin-actions.ts` | ✅ (explicit `billing_plans!employer_subscriptions_plan_id_fkey`) |
| Deprecated `unlockCandidate` | `applicants.ts` | ⚠️ Still exported; not used in main applicant cards |

---

## Frontend

| Surface | Status | Notes |
|---------|--------|-------|
| Public pricing ($0/$19/$39/$79) | ✅ | `e2e/public/pricing.spec.ts` green |
| Employer dashboard `PlanUsageCard` | ✅ | Wired to `getEmployerPlanUsage` |
| Account settings billing | ✅ **fixed** | Role check used wrong column (`auth_user_id` → `id`) on account, jobs create/detail, company settings |
| `ActivePlanSidebar` / `ManagePlanGrid` copy | ✅ **fixed** | Limits aligned to 10/20/50 tiers |
| Employer messages `messagingEnabled` | ✅ | Passed from plan usage |
| Worker messages blocked banner | ✅ | Via `thread.blocked_reason` in `ChatArea` |
| Credits route redirect | ✅ | `/employer/credits` → account settings |
| Legacy unlock UI | ⚠️ | `LockedApplicantCard.tsx` unused; admin billing ops still shows unlock counter (deprecated column) |
| Dead dashboard widgets | ⚠️ | `BillingPlan.tsx`, `HiringKit.tsx`, `PremiumUpsell.tsx` not imported (safe to delete later) |

---

## API / action matrix

See `api-endpoint-matrix.md` and `entitlement-matrix.md`. Billing rows are covered under **6T-E**; worker cross-role messaging under **6T-X**.

**Re-seed before tests:**

```bash
E2E_SEED_ENABLED=1 npm run seed:e2e
npm run seed:e2e:verify
```

---

## Playwright readiness

| Suite | Command | Blockers |
|-------|---------|----------|
| Public pricing | `npx playwright test e2e/public/pricing.spec.ts` | None (3/3 pass) |
| Employer billing/tiers | `e2e/employer/pricing-tiers.spec.ts`, `billing.spec.ts` | None (5/5 pass) |
| Full employer | `npm run test:e2e:employer` | 12 failures — legacy `E2E_EMPLOYER_EMAIL` / `loginAsEmployer` in pipeline specs; migrate to fixture personas |
| Worker | `npm run test:e2e:worker` | Not run — ready after seed |
| Admin | `npm run test:e2e:admin` | Requires `E2E_ADMIN_PASSWORD`; billing-ops spec exists |

---

## Fixes applied in this audit

1. **DB:** Signup guard allows Discovery subscription row on employer register.
2. **Auth routing:** Employer pages use `profiles.id` for role checks (was `auth_user_id`, often null).
3. **Messaging:** Server blocks worker + employer sends when employer tier disallows messaging or thread has `blocked_reason`.
4. **Copy:** Account settings tier feature bullets match pricing structure.

---

## Remaining (non-blocking for first 6T pass)

- Migrate employer pipeline E2E specs to `e2e/shared/personas.ts` tier logins.
- Remove or relabel admin unlock override field.
- Delete unused `LockedApplicantCard` and legacy dashboard billing widgets.
- Optional Layer 9: Redis cache, signed resume URLs, rate limits.

**Gate:** Proceed to **6T-W** → **6T-E** (persona migration) → **6T-A** when approved.
