# Pricing Migration — Testing Report

> **Used in TEST phase only** (Layers 5V onward). BUILD phase logs go in `master-checklist.md` only.

## Environment

| Field | Value |
|-------|-------|
| Date | 2026-06-27 |
| Production URL | `https://replace-me-psi.vercel.app` |
| Local E2E server | `next start -p 3100` via `scripts/playwright-web-server.mjs` |
| Seed | `E2E_SEED_ENABLED=1 npm run seed:e2e` — run before role-matrix tests |
| Persona password | `E2eFixture!2026` when env vars unset |
| Stripe | **Test mode** — required for billing/checkout specs |

**Pricing structure under test:** Discovery $0 · Starter $19 · Growth $39 · Scale $79

---

## Stripe setup (required before 6T billing tests)

Full guide: [`stripe-vercel-setup.md`](./stripe-vercel-setup.md) · Product IDs: [`stripe-runbook.md`](./stripe-runbook.md)

### MCP already done

- Test products/prices created ($19 / $39 / $79)
- `billing_plans.stripe_*` synced in Supabase
- Discovery ($0) has no Stripe product

### Manual checklist (Vercel — no localhost)

| Step | Action | Done |
|------|--------|------|
| 1 | Vercel env: `NEXT_PUBLIC_SITE_URL=https://replace-me-psi.vercel.app` | ☐ |
| 2 | Vercel env: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ☐ |
| 3 | Stripe webhook → `https://replace-me-psi.vercel.app/api/webhooks/stripe` + 5 events | ☐ |
| 4 | Vercel env: `STRIPE_WEBHOOK_SECRET` from Dashboard (not `stripe listen`) | ☐ |
| 5 | Stripe Customer Portal activated + 3 paid products | ☐ |
| 6 | Supabase auth Site URL + redirect URLs for Vercel domain | ☐ |
| 7 | **Redeploy** Vercel after env changes | ☐ |
| 8 | Smoke test: employer upgrade Starter with `4242…` | ☐ |

**Webhook events:** `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

---

## Pre-test audit (before 6T)

Full matrix: [`pre-test-audit.md`](./pre-test-audit.md)

| Area | Result | Notes |
|------|--------|-------|
| DB four-tier schema + seed | ✓ | Gate 5V |
| Public CMS FAQs (no $30) | ✓ | `20260627150000_pricing_v2_public_cms.sql` |
| Homepage dynamic pricing | ✓ | `getPricingData()` → 4-tier teaser |
| `/pricing` from `billing_plans` | ✓ | `getPricingData()` |
| Stripe products (test) | ✓ | MCP |
| Entitlements (L3B) | ✓ | |
| Employer E2E persona migration | ✓ | All pipeline specs use `loginAsStarterEmployer` |

---

## Layer 5V — Seed verify

| Check | Pass | Notes |
|-------|------|-------|
| `npm run seed:e2e` | ✓ | Idempotent re-run green |
| `npm run seed:e2e:verify` | ✓ | Tier limits + Discovery cap |
| All tables meet minimum rows | ✓ | See `seed-verify-report.md` |
| Re-run idempotent | ✓ | |

**Gate 5V:** ☑ Approved (2026-06-26)

---

## Layer 6T-W — Worker

**Command:** `npm run test:e2e:worker`  
**Personas:** `loginAsMaya`, `loginAsWorker2`, `loginAsWorker3` (`e2e/shared/personas.ts`)

| Spec / area | Covers | Status |
|-------------|--------|--------|
| `onboarding.spec.ts` | Worker signup flow | ☐ |
| `dashboard.spec.ts` | Stats, nav | ☐ |
| `jobs-discovery.spec.ts` | Job search | ☐ |
| `job-detail.spec.ts` / `job-apply.spec.ts` | Apply flow | ☐ |
| `applications-detail.spec.ts` | Application list + detail | ☐ |
| `messages.spec.ts` | Messaging; Discovery blocked banner | ☐ |
| `contracts.spec.ts` / `interviews.spec.ts` | Phase 2 | ☐ |
| `profile-edit.spec.ts` / `skills.spec.ts` | Profile | ☐ |
| `settings.spec.ts` / `verification.spec.ts` | Settings | ☐ |
| `saved-jobs.spec.ts` / `notifications-*.spec.ts` | Aux | ☐ |

**Stripe:** Workers do not checkout — no Stripe env required for worker-only run (unless cross-role).

**Gate 6T-W:** ☐ Approved

---

## Layer 6T-E — Employer

**Command:** `npm run test:e2e:employer` · **Tier matrix:** `npm run test:e2e:tier`  
**Personas:** `loginAsDiscoveryEmployer`, `loginAsStarterEmployer`, `loginAsGrowthEmployer`, `loginAsScaleEmployer`

| Spec / area | Covers | Status |
|-------------|--------|--------|
| `tier-entitlements.spec.ts` | All 4 tiers: usage card, applicant preview vs full, messaging gates | ✓ 16/16 tier suite |
| `pricing-tiers.spec.ts` | 4-tier UI + `PlanUsageCard` (Starter) | ✓ |
| `messages.spec.ts` | Discovery blocked vs Starter active threads | ✓ (in tier suite) |
| `billing.spec.ts` | Account settings, pricing headline | ✓ |
| `credits-ledger.spec.ts` | Credits → account redirect | ✓ |
| `applicants.spec.ts` / `applicants-kanban.spec.ts` | Pipeline views (Starter persona) | ☐ run |
| `job-creation.spec.ts` | Job create (Starter; 2/3 slots) | ☐ run |
| `pipeline-navigation.spec.ts` / `offer-hire.spec.ts` | Pipeline | ☐ run |
| `contracts-lifecycle.spec.ts` / `interviews.spec.ts` | Hiring | ☐ run |
| **Stripe checkout** (manual) | Upgrade Starter on Vercel | ☐ after Stripe steps |

**Gate 6T-E:** ☐ Approved

---

## Layer 6T-A — Admin

**Command:** `npm run test:e2e:admin`  
**Requires:** `E2E_ADMIN_PASSWORD` or `E2E_SUPERADMIN_PASSWORD`

| Spec / area | Covers | Status |
|-------------|--------|--------|
| `billing-ops.spec.ts` | Subscriptions list, usage override | ☐ |
| `moderation.spec.ts` | Job queue (Discovery 2-day approval) | ☐ |
| `disputes-workflow.spec.ts` | Disputes | ☐ |
| `applications.spec.ts` | Cross-domain applications | ☐ |
| `faq-cms.spec.ts` | CMS | ☐ |

**Stripe:** Admin views subscription rows synced from webhooks — run after Stripe Step 8 smoke test.

**Gate 6T-A:** ☐ Approved

---

## Layer 6T-X — Cross-role + public

**Commands:** `npm run test:e2e:public` · `npm run test:e2e:cross-role` · `npm run test:e2e` (full matrix)

| Journey / spec | Status |
|----------------|--------|
| `public/pricing.spec.ts` — 4 tiers $0/$19/$39/$79 | ✓ |
| `public/home-pricing.spec.ts` — homepage teaser, no $30 | ✓ |
| `cross-role/billing-entitlements.spec.ts` — Discovery blocked messaging, Starter thread | ✓ |
| `tier-entitlements.spec.ts` — per-tier employer entitlements | ☐ run |
| Hire path (Starter employer → worker contract) | ☐ seed |
| Discovery approval (admin moderates queued job) | ☐ seed |
| Dispute path (worker-3) | ☐ seed |

**Gate 6T-X:** ☐ Approved

---

## Layer 7 — Fix iterations

### Iteration 1

| Failed spec | Root cause | Fix |
|-------------|------------|-----|
| `credits-ledger.spec.ts` | Credits route removed | Redirect spec |
| `pricing.spec.ts` | FAQ heading collision | Target tier `h3` |
| Employer pipeline (12) | Legacy `E2E_EMPLOYER_EMAIL` | Migrated to `loginAsStarterEmployer` |

### Iteration 2 (public pricing v2)

| Item | Fix |
|------|-----|
| Production $30 Standard Plan | Homepage + CMS migration; deploy |
| Landing FAQs | DB-driven + v2 copy |

**Gate 7T:** ☐ Ship sign-off

---

## Recommended test order

1. Complete **Stripe manual steps** (table above) + redeploy Vercel  
2. `E2E_SEED_ENABLED=1 npm run seed:e2e && npm run seed:e2e:verify`  
3. `npm run test:e2e:public`  
4. `npm run test:e2e:tier` — four-tier entitlement matrix (fast billing smoke)  
5. `npm run test:e2e:cross-role`  
6. `npm run test:e2e:worker`  
7. `npm run test:e2e:employer`  
8. `npm run test:e2e:admin`  
9. `npm run test:e2e` — full matrix  
10. Manual Stripe checkout on https://replace-me-psi.vercel.app
