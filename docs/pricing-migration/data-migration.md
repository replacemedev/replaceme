# Data Migration — Existing Subscribers

## Plan slug mapping

| Legacy plan | New slug | Price change |
|-------------|----------|--------------|
| Discovery (free) | `discovery` | $0 — unchanged |
| Essential | `starter` | $49 → $19 (grandfather policy TBD) |
| Professional | `growth` | $149 → $39 (grandfather policy TBD) |

## Grandfathering options (choose at Gate 1B)

1. **Honor legacy price** — keep Stripe Price ID on old subscriptions; map slug to new entitlements only.
2. **Migrate at renewal** — swap `stripe_price_id` on next billing cycle with email notice.
3. **Comp override** — use `employer_subscriptions.override_plan_id` for affected accounts.

## Credit balance migration

- Stop writing `employer_credits` in Layer 3B.
- Existing credit rows: leave for audit; do not use in unlock flow.
- `unlocked_profiles`: retain as history; new unlocks use entitlements.

## Jobs in flight

- Active jobs over new tier limit: set `paused_reason = downgrade` on excess jobs.
- Pending Review Discovery jobs: keep in admin queue.

## Rollback data

See `rollback-plan.md` — snapshot `billing_plans` and `employer_subscriptions` before migration.
