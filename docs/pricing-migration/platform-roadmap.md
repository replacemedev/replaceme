# Platform Roadmap — Post-Pricing Migration

**Gate 9:** Approve epics individually after Layer 7 ship. Do not bundle into pricing migration.

## P0 — Included in Layers 1–5 (this migration)

- 4-tier entitlements (Discovery / Starter / Growth / Scale)
- Cross-role production UI (dashboard, talent, admin drill-down)
- Full database seed + phased Playwright (all roles)
- Stripe subscriptions + webhooks

## P1 — Next sprint (high value)

| Epic | Roles | Notes |
|------|-------|-------|
| Interview scheduling v2 | E, W | Real `interviews` table, calendar links, reminders |
| Application pipeline stages | E, W, A | Custom stages per job |
| Employer verification | E, A | Company KYC queue |
| Support tickets | E, W, A | Priority support tier fulfillment |
| Signed resume URLs | E | Supabase Storage + time-limited URLs |

## P2 — Growth

| Epic | Notes |
|------|-------|
| Job alerts email dispatch | Wire `worker_job_alerts` to email |
| Skill assessments take flow | Beyond catalog in `/worker/tests` |
| Search index (Typesense/pg tsvector) | Scale job board |
| Job boosts (one-time PaymentIntent) | Upsell without breaking tiers |
| Redis entitlement cache | Layer 8 optional |

## P3 — Enterprise / compliance

| Epic | Notes |
|------|-------|
| GDPR export / delete | `data_export_requests` |
| Reference checks | Scale differentiator |
| Payroll / payout records | Worker earnings v2 |
| Multi-seat hiring teams | Invites on job posts |
| Feature flags (`platform_features`) | Scale early access |

## Infrastructure

- Vercel Queues / Inngest: approval auto-escalation, email digests
- Supabase Realtime: messaging + notifications
- Read replicas when applicant volume grows
