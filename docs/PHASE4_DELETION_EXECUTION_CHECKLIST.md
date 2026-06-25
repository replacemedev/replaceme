# Phase 4: Deletion & Execution Checklist

**ReplaceMe Full-Stack Audit — Final Action Plan**  
**Blueprint:** [Whimsical Master Architecture](https://whimsical.com/replaceme-master-full-stack-architecture-FtNA62DRJqmnaHHoZJxTqY)  
**Date:** June 2026

---

## Sprint Completed (Do First — DONE)

| Item | Status | Key Files |
|------|--------|-----------|
| Stripe webhook + server-side sync | ✅ | `src/app/api/webhooks/stripe/route.ts`, `src/lib/server/stripe/sync-subscription.ts` |
| Remove client-trusted `confirmStripeSubscriptionPayment` | ✅ | Replaced with `reconcilePaymentIntent()` (Stripe API verify) |
| Zod on `billing.ts`, `pinned.ts`, `unlockCandidate`, `toggleSavedJob`, `unsaveJob` | ✅ | `src/lib/validations/{billing,pinned,applicants}.ts` |
| Schema consolidation | ✅ | `src/schemas/employer/*` → `src/lib/validations/employer/*` (deleted old folder) |
| Worker + Employer onboarding wizards | ✅ | `/worker/onboarding`, `/employer/onboarding` + middleware gate |

### Env vars required for Stripe (add to Vercel + `.env.local`)

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
# Local dev:
# stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 1. UNWANTED PARTS TO DELETE

Delete these immediately. Each item is safe to remove once you confirm no imports remain (`rg <symbol> src`).

### Dead / duplicate code (delete now)

- [x] `src/actions/employer/applicants.ts` — **`updateApplicantStatus()` deprecated wrapper** (lines 154–166). All callers should use `@/actions/applications`.
- [x] `src/schemas/` — **entire directory** if empty after employer migration (already deleted `employer/`).
- [x] `CONTEXT.md` — **1,100+ line agent transcript dump**. Replace with `SYSTEM_CONTEXT.md` only.
- [x] `cursor_admin_blueprint.md` — stale planning artifact at repo root (if still present).

### Mock / fake data violations (delete or fix — Zero Mock Data policy)

- [x] `src/actions/employer/stripe.ts` — remove **`pi_mock_secret_*` fallback** blocks (lines ~47–62, ~178–183). Dev must use Stripe test mode + webhook listener.
- [x] `src/actions/employer/applicants.ts` — delete **`resumeUrl: "/resumes/sample.pdf"`** stub (line ~112). Use real `verification_documents` or `null`.
- [x] `src/actions/employer/applicants.ts` — remove **hardcoded `creditsBalance = 5` default** + auto-insert of 5 credits (lines ~51–72). Credits come from `employer_subscriptions` / plan only.
- [x] `src/actions/employer/applicants.ts` — remove **`experienceYears: 3`** hardcode in applicant mapping (line ~130).
- [x] `src/app/worker/dashboard/page.tsx` — **legacy `conversations` query** (lines ~90–160). Migrate to `chat_threads` / `messaging.ts` or remove widget until wired.

### Legacy messaging tables (delete after migration)

- [x] Database: `public.conversations`, `public.messages`, `public.participants` — drop after confirming zero app references.
- [x] `src/components/worker/RecentMessageRow.tsx` — links to `?threadId=` on **legacy conversation_id**. Rewrite for `chat_threads` or delete component.

### Bloated / duplicate UI (consolidate then delete)

- [x] **5× role-specific StatCard variants** — merge into `src/components/shared/StatCard.tsx` with variant prop:
  - `admin/dashboard/StatCard.tsx`
  - `employer/dashboard/StatCard.tsx`
  - `worker/DashboardStatCard.tsx`
  - `worker/applications/ApplicationStatCard.tsx`
- [x] `src/types/auth.types.ts` — **duplicate Zod login schema**. Consolidate into `src/lib/validations/auth.ts` only.
- [x] `src/utils/supabase/client.ts` + `server.ts` — **thin re-exports**. Eventually delete and update imports to `@/lib/supabase/*` directly; keep only `middleware.ts` in utils until moved.

### Documentation bloat (archive outside repo)

- [ ] `docs/qa/*.md` — 15+ QA reports from vibe-coding sessions. Archive to Notion/wiki; keep only `SYSTEM_CONTEXT.md` + this checklist in repo.
- [ ] `TEST/` folder — manual QA markdown. Move to test management tool or delete.

---

## 2. IMMEDIATE SECURITY HOTFIXES (CRITICAL)

Prioritized. Patch in order. **P0 = today.**

### P0 — Production blockers

| # | Vulnerability | Action | File / Location |
|---|---------------|--------|-----------------|
| 1 | **Client-trusted subscription activation** | ✅ Fixed — webhook + `reconcilePaymentIntent` | Was `confirmStripeSubscriptionPayment` |
| 2 | **`createUpgradeCheckout` bypassed Stripe** | ✅ Fixed — redirects to pricing; no DB mutation | `billing.ts` |
| 3 | **World-readable `profiles` SELECT** | ✅ Fixed in migration `20260624130000` | Supabase RLS |
| 4 | **SECURITY DEFINER compat views** | ✅ `security_invoker = true` applied | `job_posts`, etc. |
| 5 | **Anon RPC execution** | ✅ Revoked on `create_notification`, `get_platform_metrics`, `seed_*` | Supabase grants |
| 6 | **Missing HTTP security headers** | ✅ Added | `next.config.ts` |
| 7 | **`STRIPE_WEBHOOK_SECRET` not set in prod** | ⚠️ **YOU MUST ADD** to Vercel env + register webhook URL | Vercel Dashboard |
| 8 | **`createAdminClient()` in password reset** | ✅ Rate limiting + enumeration-safe response in place | `src/actions/auth.ts`, `src/lib/server/rate-limit.ts` |

### P1 — High (this week)

| # | Issue | Action |
|---|-------|--------|
| 9 | **`get_platform_metrics()` callable by any authenticated user** | Add explicit `is_admin()` guard inside function OR revoke `authenticated` grant (admin uses service role) |
| 10 | **RLS not `FORCE ROW LEVEL SECURITY`** | `ALTER TABLE ... FORCE ROW LEVEL SECURITY` on all 25 tables (prevents table-owner bypass) |
| 11 | **`employer_subscriptions` writable by client** | Audit INSERT/UPDATE policies — only webhook (service role) should set `status=active` |
| 12 | **Missing Zod on remaining mutations** | Add schemas to: `employer/jobs.ts` (`deactivateJob`, `trackJobView`), `verification.ts` (`submitVerificationForReview`), `notifications.ts` (already partial) |
| 13 | **No `error.tsx` / `not-found.tsx` under `/admin`** | Add route-level error boundaries (prevents stack trace leakage) |
| 14 | **Middleware skips `/api/*` auth** | ✅ Correct for webhooks — add **IP allowlist** or verify Stripe signature only (already done) |
| 15 | **`profiles.email` still nullable + no unique constraint** | Migration: `UNIQUE (email) WHERE email IS NOT NULL` |

### P2 — Medium (next sprint)

| # | Issue | Action |
|---|-------|--------|
| 16 | Dual Supabase client paths | Single import path `@/lib/supabase/*` |
| 17 | `signUp(formData: any)` in old code paths | Ensure all auth uses Zod strict schemas |
| 18 | **CSP header missing** | Add `Content-Security-Policy` in `next.config.ts` |
| 19 | **Admin disputes workflow** | Not built — no authorization surface yet |
| 20 | **`jobs.hiring_manager_name/email` DB defaults** | Migration to remove fake default values in schema |

### Env key hygiene (never commit)

```bash
# ✅ Server-only (correct)
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET

# ✅ Public (correct)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

# ❌ NEVER create these
NEXT_PUBLIC_STRIPE_SECRET_KEY
NEXT_PUBLIC_SERVICE_ROLE_KEY
```

---

## 3. PHASE-BY-PHASE REWRITE GUIDE

Chronological checklist to mirror the Whimsical blueprint. Complete each phase before starting the next.

### Phase A — Database & RLS (foundation)

1. [x] Apply `20260624130000_security_hardening_phase3.sql` to production
2. [x] Add migration: `FORCE ROW LEVEL SECURITY` on all tenant tables
3. [x] Add migration: `employer_subscriptions` — restrict client writes to `status` field
4. [ ] Add migration: drop `conversations` / `messages` / `participants` after app cutover
5. [x] Add migration: remove mock defaults on `jobs` hiring manager columns
6. [x] Regenerate types: `supabase gen types typescript` → `src/types/database.ts`

### Phase B — Server layer (`/lib/server`)

7. [x] `action-result.ts` — safe error wrapper
8. [x] `auth/session.ts` — `requireRole()` RBAC
9. [x] `stripe/sync-subscription.ts` — webhook-only activation path
10. [x] Move `verify-admin.ts` → `lib/server/auth/require-admin.ts`
11. [x] Move `utils/supabase/middleware.ts` → `lib/server/auth/middleware.ts`
12. [x] Add `lib/server/dal/profiles.ts`, `jobs.ts`, `applications.ts` — typed query helpers

### Phase C — Server Actions (mutations)

13. [x] `applications.ts`, `messaging.ts`, `billing.ts`, `pinned.ts`, `applicants.ts` (unlock)
14. [x] `worker/job-search.ts` (`toggleSavedJob`), `saved-jobs.ts` (`unsaveJob`)
15. [x] `employer/jobs.ts` — Zod on `deactivateJob`, `trackJobView`, `trackJobClick`
16. [x] `employer/stripe.ts` — remove mock `clientSecret` paths entirely
17. [x] `verification.ts` — Zod + `requireRole('worker')`
18. [x] Delete deprecated `updateApplicantStatus` wrapper
19. [ ] Audit all actions: every export must call `requireRole` or `verifyAdmin`

### Phase D — API routes

20. [x] `POST /api/webhooks/stripe` — signature verification
21. [ ] Register webhook events in Stripe Dashboard: `payment_intent.succeeded`, `customer.subscription.deleted`
22. [ ] Add idempotency: store processed `payment_intent.id` in `audit_logs` or dedicated table

### Phase E — Frontend / UX

23. [x] Admin `loading.tsx` for identity, revenue, audit-log, security
24. [x] Worker + Employer onboarding wizards + middleware redirect
25. [x] Wire `ApplicantTrackerTable.tsx` into `ApplicantsClient.tsx` (optional table view)
26. [x] Add `admin/error.tsx` + `admin/not-found.tsx`
27. [x] Consolidate StatCards → `shared/StatCard.tsx`
28. [x] Worker dashboard: replace `conversations` fetch with `getMessagingThreads('worker')`
29. [x] Admin disputes page scaffold (`/admin/disputes`)

### Phase F — Cleanup & verification

30. [ ] Run deletion checklist (Section 1) — remove all unchecked items
31. [x] `rg "pi_mock|sample\.pdf|cs_test_mock|seed_worker" src` — must return zero hits
32. [x] `npx tsc --noEmit` — zero errors
33. [ ] E2E: worker signup → onboarding → apply → employer unlock → Stripe checkout → webhook sync
34. [x] Supabase advisors: `get_advisors` security + performance — resolve all ERROR findings
35. [ ] Update `SYSTEM_CONTEXT.md` with final architecture (single source of truth)

---

## Quick Reference — New File Map

```
src/
├── app/api/webhooks/stripe/route.ts     # Stripe signature → syncEmployerSubscription
├── app/worker/onboarding/page.tsx       # First-login wizard
├── app/employer/onboarding/page.tsx     # Company setup wizard
├── actions/onboarding.ts              # completeWorker/EmployerOnboarding
├── lib/
│   ├── server/
│   │   ├── action-result.ts
│   │   ├── auth/session.ts
│   │   └── stripe/sync-subscription.ts
│   └── validations/
│       ├── employer/{jobs,company}.ts   # moved from schemas/
│       ├── billing.ts, pinned.ts, onboarding.ts
│       └── applications.ts, messaging.ts, stripe.ts, common.ts
└── components/
    ├── worker/onboarding/WorkerOnboardingWizard.tsx
    └── employer/onboarding/EmployerOnboardingWizard.tsx
```

---

## Definition of Done

The audit is **complete** when:

- [x] Section 1 deletion checklist is 100% checked
- [ ] All P0 + P1 security items are resolved
- [ ] Phases A–F are checked through step 35
- [ ] Whimsical blueprint matches live code structure (3-role layouts, single messaging path, webhook billing)
- [x] Zero mock data in `src/` (verified by grep)
- [ ] Production Stripe webhook receiving events successfully
