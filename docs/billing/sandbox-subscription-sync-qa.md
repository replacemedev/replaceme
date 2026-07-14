# Stripe sandbox — subscription sync QA

**Mode:** Test only (`sk_test_…`, `pk_test_…`, webhook signing secret from CLI or Dashboard test endpoint).  
**Do not** flip to live until this checklist passes.

## Root cause (fixed)

1. Webhook preferred stale `subscription.metadata.plan_slug` over the **live Stripe price** after Customer Portal upgrades → DB could stay on Discovery/wrong tier while Stripe showed Growth paid.
2. Missing `employer_id` on the Subscription object hard-failed sync (no customer / DB fallback).
3. Checkout return only `router.refresh()`’d — did not re-project from Stripe when the webhook lagged.

## What changed

| File | Change |
|------|--------|
| `sync-subscription.ts` | Price-first → product → metadata fallbacks; employer resolve via meta / DB customer / Stripe customer meta; metadata repair; `reconcileEmployerSubscriptionFromStripe` |
| `webhooks/stripe/route.ts` | Expand price; checkout session meta overrides; mode logging |
| `checkout-session.ts` | `client_reference_id` = employer UUID |
| `actions/employer/billing.ts` | `reconcileBillingFromStripe` + `revalidatePath` |
| Account settings UI | Auto-reconcile on `?checkout=success` |

## Sandbox env checklist

```bash
# .env.local (TEST keys only)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # from `stripe listen` OR Dashboard test endpoint
```

Confirm `billing_plans.stripe_price_id` matches **test** prices:

```sql
SELECT slug, stripe_price_id, stripe_product_id, price FROM billing_plans order by price;
-- growth should be ~$39 → price_… that exists in Stripe TEST mode
```

## Local webhook forward

```bash
# Terminal A — app
npm run dev

# Terminal B — Stripe CLI (sandbox)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy the whsec_… into STRIPE_WEBHOOK_SECRET and restart Next
```

### Trigger events

```bash
# Generic (may lack your metadata — use real Checkout for full path)
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.paid
```

### Real path (preferred)

1. Employer account on Discovery in local/staging pointed at **test** Stripe.
2. Manage plan → Growth → complete Checkout with test card `4242…`.
3. Watch CLI + Vercel/local logs for:
   - `[Stripe] Processing checkout.session.completed … mode=test`
   - `[Stripe] Plan resolved by price_id=price_… → growth`
   - `[Stripe] Subscription synced … plan=growth status=active`
4. Land on `/employer/settings/account?checkout=success` → auto “Sync plan from Stripe”.
5. UI shows Growth; Email Support / paid limits unlock.
6. Upgrade Growth → Scale via Portal → confirm DB `plan_slug` follows **price**, not old metadata.
7. Downgrade Scale → Growth via Portal → expect **no mid-cycle charge**; UI banner shows pending Growth at period end; `scheduled_plan_slug=growth`.
8. Cancel → Discovery → `cancel_at_period_end=true`; access until period end.

## Period-end policy (hybrid)

| Action | Timing |
|--------|--------|
| Upgrade | Immediate + prorated invoice (`always_invoice`) |
| Downgrade | End of period (`schedule_at_period_end` / Subscription Schedule) |
| Cancel | End of period (`cancel_at_period_end`) |

Portal config is upserted by `ensurePortalPlanChangeConfiguration()` on plan-change / portal session open.

Webhook events to subscribe (add):
- `subscription_schedule.created|updated|released|completed|canceled|aborted`

## Vercel preview (sandbox)

1. Project env: `STRIPE_SECRET_KEY=sk_test_…`, webhook secret from Dashboard **test** endpoint URL → `https://<preview>/api/webhooks/stripe`.
2. Subscribe these events (test endpoint):
   - `checkout.session.completed`
   - `customer.subscription.created|updated|deleted`
   - `subscription_schedule.*`
   - `invoice.paid` / `invoice.payment_failed`
   - `charge.dispute.*` (optional for this bug)
3. Complete a Growth Checkout in the preview URL; confirm logs + UI.

## Stuck account recovery (sandbox)

If invoices show Paid in billing history but UI is still Discovery:

1. Open Account settings → after checkout, click **Sync plan from Stripe**, or  
2. Re-run reconcile (same Server Action as webhooks — not a manual VIP override).

```sql
-- Expect growth / active + stripe_subscription_id after sync
SELECT plan_slug, status, stripe_subscription_id, unit_amount_cents, last_stripe_event_id
FROM employer_subscriptions
WHERE employer_id = '<uuid>';
```

## Go-live gate

Only after sandbox checklist is green:

1. Swap to `sk_live` / live webhook secret / live price IDs in `billing_plans`.
2. Point a **live** webhook endpoint at production `/api/webhooks/stripe` with the same events.
3. One smoke checkout with a real card (then refund in Dashboard if needed).
