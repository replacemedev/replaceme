# Rollback Plan

## Before Layer 1B migration

1. Export `billing_plans`, `employer_subscriptions` (CSV or `pg_dump` table-only).
2. Note current Stripe Price IDs in `stripe-runbook.md`.
3. Tag git commit: `pre-pricing-v2`.

## If Layer 1B fails

1. Revert migration file; `supabase db reset` on local.
2. Restore types from git.

## If Layer 2B Stripe breaks production billing

1. Disable webhook endpoint in Stripe Dashboard.
2. Revert to previous deployment (Vercel rollback).
3. Subscriptions remain in Stripe; DB may be stale — reconcile manually.

## If Layer 3B enforcement blocks legitimate users

1. Feature flag: env `ENTITLEMENTS_ENFORCEMENT=0` (add in Layer 3B if needed).
2. Admin `adminOverrideSubscriptionUsage` for hotfix accounts.

## Seed scripts

- Never run `seed:e2e` against production (`E2E_SEED_ENABLED` guard).
- Rollback seed: truncate fixture UUIDs only on staging.

## Communication

- Document incident in `audit_logs` + `testing-report.md` Layer 7 iteration.
