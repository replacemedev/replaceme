# Stripe Runbook

> **Full setup guide:** [`stripe-setup.md`](./stripe-setup.md) (MCP automation + manual steps)  
> **Vercel production (no localhost):** [`stripe-vercel-setup.md`](./stripe-vercel-setup.md)  
> **Webhook deep-dive (step-by-step):** [`stripe-webhook-setup.md`](./stripe-webhook-setup.md)

## Products (test mode) — configured 2026-06-26

| Slug | Product name | Monthly | `stripe_product_id` | `stripe_price_id` | Lookup key |
|------|--------------|---------|---------------------|-------------------|------------|
| discovery | — | $0 | — | — | — (no Stripe product) |
| starter | Replace Me Starter | $19 | `prod_UmW7J2RzVLIejM` | `price_1Tmx5S04XnBh2V7aYe5kFp8R` | `replaceme_starter_monthly` |
| growth | Replace Me Growth | $39 | `prod_UmW71PBiBAfnD5` | `price_1Tmx5S04XnBh2V7aaJdEfLUc` | `replaceme_growth_monthly` |
| scale | Replace Me Scale | $79 | `prod_UmW7Y9bQq0jFlA` | `price_1Tmx5V04XnBh2V7aGr4n1Ion` | `replaceme_scale_monthly` |

**Account:** `acct_1TkeHq04XnBh2V7a` (Replace Me sandbox, test mode)

## Webhook events (required)

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

Endpoint: `/api/webhooks/stripe`

## Env vars

| Var | Purpose |
|-----|---------|
| `STRIPE_SECRET_KEY` | Server API (`sk_test_…`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client (`pk_test_…`) |
| `STRIPE_WEBHOOK_SECRET` | Signature verify (`whsec_…`) |
| `STRIPE_PRICE_STARTER` / `GROWTH` / `SCALE` | Optional env overrides |

## Test cards

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## Customer Portal

Enable in Stripe Dashboard → Settings → Billing → Customer portal.  
Link from `/employer/settings/account` after Layer 2B.

## Idempotency

`stripe_webhook_events` table stores `event_id` — skip duplicate processing.

## Local dev

1. `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
2. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`
3. Checkout uses `billing_plans.stripe_price_id` (synced from Stripe MCP setup)
