# E2E Seed Verify Report

> Generated after `npm run seed:e2e:verify`. Required before **Gate 5V**.

## Run metadata

| Field | Value |
|-------|-------|
| Date | 2026-06-26 |
| Command | `E2E_SEED_ENABLED=1 npm run seed:e2e` then `npm run seed:e2e:verify` |
| Target | Remote Supabase (dev/staging) |
| Exit code | 0 |
| Re-run idempotent | Yes (second `seed:e2e` + verify green) |

**Pricing tiers verified:** Discovery $0/1 job/10 applicants · Starter $19/3/20 · Growth $39/10/50 · Scale $79/unlimited

---

## Table coverage

| Table | Min rows | Actual | FK OK | Notes |
|-------|----------|--------|-------|-------|
| `auth.users` | 9 | 16+ | ✓ | 9 personas + 7 filler applicants |
| `profiles` | 16 | 23 | ✓ | Includes legacy dev accounts |
| `admin_profiles` | 2 | 2 | ✓ | |
| `company_profiles` | 4 | 7 | ✓ | |
| `billing_plans` | 4 | 4 | ✓ | 4-tier pricing v2 |
| `employer_subscriptions` | 4 | 7 | ✓ | |
| `employer_plan_usage` | 4 | 4 | ✓ | |
| `entitlement_denials` | 1+ | 2 | ✓ | job_limit + messaging |
| `jobs` | 8 | 69 | ✓ | 8 fixture jobs + legacy |
| `applications` | 15 | 15 | ✓ | |
| `application_stage_history` | 15+ | 31 | ✓ | |
| `chat_threads` | 4 | 4 | ✓ | |
| `chat_messages` | 10 | 10 | ✓ | |
| `contracts` | 2 | 2 | ✓ | |
| `interviews` | 2 | 2 | ✓ | |
| `worker_skills` | 9+ | 9 | ✓ | |
| `worker_projects` | 3+ | 3 | ✓ | |
| `worker_saved_jobs` | 3+ | 3 | ✓ | |
| `earnings_overview` | 2+ | 2 | ✓ | |
| `worker_job_alerts` | 2+ | 7 | ✓ | |
| `skill_assessments` | 1+ | 1 | ✓ | |
| `disputes` | 1 | 1 | ✓ | |
| `verification_documents` | 1+ | 2 | ✓ | |
| `pinned_workers` | 1+ | 2 | ✓ | |
| `employer_testimonials` | 1+ | 1 | ✓ | |
| `notifications` | 9+ | 91 | ✓ | |
| `notification_preferences` | 9 | 10 | ✓ | |
| `faqs` | 4+ | 4 | ✓ | Tier-aware copy |
| `testimonials` | 4+ | 4 | ✓ | |
| `page_content` | 3+ | 5 | ✓ | |
| `audit_logs` | 3+ | 3 | ✓ | |

---

## Orphan / integrity checks

| Check | Pass | Details |
|-------|------|---------|
| No orphan `applications` | ✓ | |
| No orphan `chat_messages` | ✓ | |
| No orphan `contracts` | ✓ | |
| Discovery job has exactly 10 applicants | ✓ | Cap edge (worker-3) |
| Discovery blocked messaging thread | ✓ | `messaging_disabled` |
| Billing plan entitlements | ✓ | All four tiers match spec |

**Gate 5V:** ☑ Approved (2026-06-26)
