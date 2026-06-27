# Pricing Migration Master Checklist

> **BUILD phase:** Layers 0–5B (verify only — no Playwright).  
> **TEST phase:** 5V → 6T-W → 6T-E → 6T-A → 6T-X → 7.  
> Agent stops at each Gate until you reply **Proceed**.

## Phase 0 — Documentation (BUILD)

- [x] tier-spec.md + entitlement-matrix.md
- [x] cross-role-matrix.md + api-endpoint-matrix.md
- [x] e2e-fixture-spec.md (personas + all tables)
- [x] schema-by-role.md, data-migration.md, rollback-plan.md
- [x] stripe-runbook.md, platform-roadmap.md
- [x] implementation-prompt.md
- [x] testing-report.md + seed-verify-report.md templates
- [x] prompt.md synced (`npm run prompt:sync`) — 2026-06-26
- [x] **Gate 0 approved** (2026-06-26)

## BUILD phase (no Playwright)

### Layer 1B — Schema

- [x] migration + RLS + application_stage_history (`20260627120000_pricing_v2_four_tiers.sql`)
- [x] Supabase remote applied (billing → tables → functions → RLS)
- [x] `src/types/database.ts` regenerated
- [x] npm run build passes
- [x] **Gate 1B approved** (2026-06-26)

### Layer 2B — Stripe

- [x] Checkout Sessions (subscription mode) + hosted redirect
- [x] Webhooks: checkout.session.completed, subscription lifecycle, invoice.payment_failed
- [x] Idempotency via `stripe_webhook_events`
- [x] Customer Portal from account settings
- [x] `sync-subscription` v2 (plan_slug, billing periods, no credit grants)
- [x] Test-mode products/prices via Stripe MCP + `billing_plans` sync
- [x] Vercel setup doc: `stripe-vercel-setup.md` (manual webhook + env)
- [x] npm run build passes
- [x] **Gate 2B approved** (2026-06-26)

### Layer 3B — Enforcement

- [x] `src/lib/server/entitlements.ts` — RPC wrappers, assertions, denial logging, plan usage
- [x] Job post limit + approval mode (`createJobPost`)
- [x] Applicant cap + anonymous preview (`getApplicants`, `submitJobApplication`)
- [x] Messaging gate (`sendMessagingMessage`)
- [x] Resume / identity gates (`getEmployerCandidateProfile`, deprecated `unlockCandidate`)
- [x] Reviews + pin soft gates (Discovery blocked)
- [x] Dashboard recent applicants entitlement masking
- [x] `getEmployerPlanUsage` exported from billing actions
- [x] npm run build passes
- [x] **Gate 3B approved** (2026-06-26)

### Layer 4B — UI (4B-i … 4B-vi)

- [x] **4B-i** — credits nav removed; `/employer/credits` redirects; unlock UI removed from applicants
- [x] **4B-ii** — 4-tier `pricing.ts`, `PricingCards`, `CompareTable`, public + employer pricing
- [x] **4B-iii** — `PlanUsageCard` on dashboard; upgrade banners; job create copy
- [x] **4B-iv** — `MessagingThreadStatus` + employer messaging gate UI
- [x] **4B-v** — admin revenue `PlanTierBadge`, usage copy
- [x] **4B-vi** — shared `PlanTierBadge`, `PlanUsageCard`, `map-billing-plan`
- [x] Landing pricing teaser — 4 tiers from `billing_plans` via `getPricingData()` on homepage
- [x] Public CMS FAQs migrated — no legacy $30 copy (`20260627150000_pricing_v2_public_cms.sql`)
- [x] npm run build passes
- [x] **Gate 4B approved** (2026-06-26)

### Layer 5B — Full DB seed

- [x] `scripts/e2e-fixtures/**` — manifest, shared, 10 domain seeders
- [x] `scripts/seed-e2e-fixtures.mjs` + `scripts/verify-e2e-fixtures.mjs`
- [x] `npm run seed:e2e` / `seed:e2e:verify` in package.json
- [x] Playwright persona helpers (`e2e/shared/personas.ts` + tier logins)
- [x] Persona graph: Discovery cap (10 applicants), tier employers, blocked messaging, denials
- [x] `npm run seed:e2e:verify` passes (2026-06-26)
- [x] **Gate 5B approved** (2026-06-26)

## TEST phase (after full build)

**Prerequisite:** Complete Stripe on Vercel — [`stripe-vercel-setup.md`](./stripe-vercel-setup.md) (Steps 1–7 + redeploy).

### Layer 5V — Seed verify

- [x] `seed:e2e` + `seed:e2e:verify` — all tables, zero FK errors (2026-06-26)
- [x] seed-verify-report.md complete
- [x] **Gate 5V approved** (2026-06-26)

### Layer 6T-W — Worker

- [ ] all worker specs green (api-endpoint-matrix Worker column)
- [ ] **Gate 6T-W approved** ← TEST phase in progress

### Layer 6T-E — Employer

- [ ] all employer specs green (billing = one section) — **21/35** pricing/billing/credits green
- [ ] **Gate 6T-E approved**

### Layer 6T-A — Admin

- [ ] all admin specs green
- [ ] **Gate 6T-A approved**

### Layer 6T-X — Cross-role + public

- [ ] hire path, discovery approval, disputes, public specs
- [ ] `npm run test:e2e` full matrix green
- [ ] testing-report.md complete
- [ ] **Gate 6T-X approved**

### Layer 7 — Fix & ship

- [ ] 7B/7T iterations until green
- [ ] **Gate 7T — SHIP**
