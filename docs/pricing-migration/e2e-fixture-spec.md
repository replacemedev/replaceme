# E2E Fixture Spec — Human-Like Seed Data

**Guard:** `E2E_SEED_ENABLED=1` required. Scripts exit on production.  
**Pattern:** Supabase Auth Admin API + service role ([`scripts/seed-admin.mjs`](../../scripts/seed-admin.mjs)).

**Build status:** Personas and graph below are **specified** here; scripts and data are **Layer 5B**. Schema prerequisites are **Layer 1B**.

| Artifact | Layer | Status |
|----------|-------|--------|
| Env passwords in `.env.example` | 0 | Done |
| `billing_plans` 4-tier rows | 1B | Migration |
| `admin_profiles`, `interviews`, `application_stage_history`, etc. | 1B | Migration |
| `scripts/e2e-fixtures/**` | 5B | Done |
| Playwright persona helpers | 5B | Done |
| `seed-verify-report.md` thresholds met | 5V | After 5B — verify script green 2026-06-26 |

---

## Environment variables

Add to `.env.local` (documented in `.env.example`):

| Variable | Account |
|----------|---------|
| `E2E_WORKER_1_PASSWORD` | e2e-worker-1@replaceme.test |
| `E2E_WORKER_2_PASSWORD` | e2e-worker-2@replaceme.test |
| `E2E_WORKER_3_PASSWORD` | e2e-worker-3@replaceme.test |
| `E2E_EMPLOYER_DISCOVERY_PASSWORD` | e2e-employer-discovery@replaceme.test |
| `E2E_EMPLOYER_STARTER_PASSWORD` | e2e-employer-starter@replaceme.test |
| `E2E_EMPLOYER_GROWTH_PASSWORD` | e2e-employer-growth@replaceme.test |
| `E2E_EMPLOYER_SCALE_PASSWORD` | e2e-employer-scale@replaceme.test |
| `E2E_ADMIN_PASSWORD` | e2e-admin@replaceme.test |
| `E2E_SUPERADMIN_PASSWORD` | e2e-superadmin@replaceme.test |

Legacy helpers may keep `E2E_EMPLOYER_EMAIL` / `E2E_WORKER_EMAIL` until e2e helpers migrate (**5B**).

---

## Personas (9 users)

Stable UUIDs live in `scripts/e2e-fixtures/manifest.mjs` (**Layer 5B**).

| Email | Role | Plan | Persona | Seed layer |
|-------|------|------|---------|------------|
| `e2e-worker-1@replaceme.test` | worker | — | **Maya Chen** — Senior React dev, verified, 2 applications, active Starter employer thread, 1 contract offered | 5B |
| `e2e-worker-2@replaceme.test` | worker | — | **James Okonkwo** — Full-stack, interview scheduled with Growth employer | 5B |
| `e2e-worker-3@replaceme.test` | worker | — | **Sofia Rivera** — Applied to Discovery job (cap edge), filed dispute | 5B |
| `e2e-employer-discovery@replaceme.test` | employer | Discovery | **Nova Labs** — 1 pending job, 10 applicants, no messaging | 5B |
| `e2e-employer-starter@replaceme.test` | employer | Starter | **BrightHire Co** — 2 active jobs, messages worker-1, offered contract, testimonial | 5B |
| `e2e-employer-growth@replaceme.test` | employer | Growth | **ScalePath Inc** — Priority job, 30+ applicants | 5B |
| `e2e-employer-scale@replaceme.test` | employer | Scale | **Global Teams LLC** — 5+ active jobs, multiple hires | 5B |
| `e2e-admin@replaceme.test` | admin | moderator | **Alex Morgan** — jobs + identity queue | 5B · L1B `admin_profiles` |
| `e2e-superadmin@replaceme.test` | admin | superadmin | **Sam Patel** — billing overrides | 5B · L1B `admin_profiles` |

Each persona gets: `profiles` row (avatar URL, title, location, bio), role-appropriate onboarding complete.

**L1B columns used by seed (must exist before 5B):** `profiles.expected_salary_*`, `employer_subscriptions.plan_slug`, `jobs.priority_score`, `applications.is_within_plan_cap`, `chat_threads.blocked_reason`.

---

## Relational graph (minimum)

### Jobs (8+)

| Job | Employer | Status | Notes | Layer |
|-----|----------|--------|-------|-------|
| J1 | Discovery | Pending Review | Admin queue; 10 applicants (cap) | 5B |
| J2 | Starter | Active | worker-1 applied | 5B |
| J3 | Starter | Active | contract path | 5B |
| J4 | Growth | Active | `priority_listing`; worker-2 applied | 5B · L1B `priority_score` |
| J5–J8 | Scale | Active | varied applicant counts | 5B |

### Applications (15+)

Statuses mix: `SUBMITTED`, `UNDER_REVIEW`, `INTERVIEW_SCHEDULED`, `OFFERED`, `REJECTED`.  
Each has `application_stage_history` rows (3+ events on key applications). **L1B** table · **5B** seed.

### Messaging (4+ threads, 10+ messages)

- Starter ↔ worker-1: multi-message with replies
- Growth ↔ worker-2: short thread
- Discovery: **no** employer-initiated threads (worker-3 may have inbound only if product allows)
- Discovery blocked thread: `blocked_reason = 'messaging_disabled'` for **L6T-X** banner test (**5B**)

### Contracts (2+)

- Starter → worker-1: `offered` (accept in 6T-X)
- Scale → worker-2: `active`

### Interviews (2+)

- worker-2 + Growth job: `scheduled_at`, `meeting_url` in **`interviews`** table (**L1B**)
- worker-1 + Starter: interview scheduled status + history row

### Disputes (1)

- worker-3 reports Discovery employer; `under_review`; `employer_id` + `job_id` set (schema **Built**)

### Verification

- worker-1: `approved` with `verification_documents`
- worker-3: `documents_submitted` in admin queue

### Entitlement denials (optional, for upgrade UX tests)

- Discovery employer: 1× `job_limit`, 1× `messaging` denial row (**L1B** table · **5B** seed · **L6T-E**)

### Billing ops (superadmin)

- Scale employer: use **Override usage** in `admin/billing-ops.spec.ts` (no pre-seeded override — keeps Scale tier E2E green)

---

## Table minimum rows

See [`seed-verify-report.md`](./seed-verify-report.md) for verify script thresholds.

| Domain | Tables | L1B schema | 5B seed |
|--------|--------|------------|---------|
| Auth | `auth.users`, `profiles`, `admin_profiles`, `company_profiles` | `admin_profiles` new | all personas |
| Billing | `billing_plans`, `employer_subscriptions`, `employer_plan_usage`, `entitlement_denials` | new usage/denials | 4 plan assignments |
| Marketplace | `jobs`, `applications`, `application_stage_history`, `chat_threads`, `chat_messages`, `contracts`, `interviews` | history + interviews new | full graph |
| Worker | `worker_skills`, `worker_projects`, `worker_saved_jobs`, `earnings_overview`, `worker_job_alerts`, `verification_documents` | skill columns | per persona |
| Employer | `pinned_workers`, `employer_testimonials` | — | Starter/Growth |
| Trust | `disputes`, `audit_logs` | — | worker-3 dispute |
| Comms | `notifications`, `notification_preferences` | — | sample rows |
| CMS | `faqs`, `testimonials`, `page_content` | — | minimal |
| Legacy | `employer_credits`, `unlocked_profiles` | deprecate in L3B | empty or historical only |
| Webhooks | `stripe_webhook_events` | L1B | optional test event in 5B |

---

## Scripts (Layer 5B)

```
scripts/seed-e2e-fixtures.mjs          # orchestrator
scripts/e2e-fixtures/manifest.mjs      # UUIDs + personas
scripts/e2e-fixtures/domains/
  auth.mjs profiles.mjs billing.mjs jobs.mjs
  applications.mjs messaging.mjs contracts.mjs
  worker.mjs admin.mjs cms.mjs
scripts/verify-e2e-fixtures.mjs
```

**npm:** `seed:e2e`, `seed:e2e:verify` (add in **5B**)

---

## Playwright helpers

- `e2e/shared/personas.ts` — credentials for all 9 personas
- `e2e/shared/fixtures.ts` — stable job/thread UUIDs from manifest
- `e2e/worker/helpers/auth.ts` — `loginAsMaya`, `loginAsJames`, `loginAsSofia`
- `e2e/employer/helpers/auth.ts` — `loginAsDiscoveryEmployer`, `loginAsStarterEmployer`, etc.
- `e2e/admin/helpers/auth.ts` — `loginAsAdmin()`, `loginAsSuperadmin()`

**Tier matrix command:** `npm run test:e2e:tier`  
**Cross-role command:** `npm run test:e2e:cross-role`

---

## Cross-role scenarios (Layer 6T-X — require 5B seed)

| Scenario | Personas | Validates |
|----------|----------|-----------|
| Discovery job approval | admin + Discovery employer | Admin queue · worker apply |
| Applicant cap edge | Discovery + worker-3 as 10th | L3B cap · `is_within_plan_cap` |
| Messaging blocked | Discovery employer + worker-3 | `cross-role/billing-entitlements.spec.ts` · L4B banner · L3B gate |
| Per-tier entitlements | all 4 employer personas | `employer/tier-entitlements.spec.ts` |
| Full hire path | Starter + worker-1 | apply → message → offer → contract |
| Priority listing | Growth job on public board | L4B badge |
| Billing upgrade smoke | Discovery → Starter | L2B Stripe (test mode) |
| Superadmin override | superadmin + Scale employer | L1B override columns |
