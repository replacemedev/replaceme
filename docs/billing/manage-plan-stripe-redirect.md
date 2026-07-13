# Manage Plan — Stripe-hosted confirmation only

**Status:** Implemented (2026-07-13)  
**Surface:** `/employer/settings/account#manage-plan`  
**Constraint:** Never auto-mutate Stripe subscriptions from the app. Employers must confirm on Stripe Checkout or Customer Portal. Local DB tier updates only via webhooks.

## Flow

| Employer state | Session type | Stripe host |
| --- | --- | --- |
| No active paid subscription | Checkout Session (`mode=subscription`) | `checkout.stripe.com` |
| Active / trialing / past_due paid sub | Portal `flow_data.type = subscription_update_confirm` | `billing.stripe.com` |
| Cancel → Discovery | Portal `flow_data.type = subscription_cancel` | `billing.stripe.com` |

## Code map

- `src/lib/server/stripe/plan-change-session.ts` — session URL generator (source of truth)
- `src/actions/employer/billing.ts` → `createUpgradeCheckout`, `cancelSubscription`
- `src/actions/employer/stripe.ts` → `createStripeCheckoutSession`
- Frontend redirect: `AccountSettingsClient` → `window.location.href = url`
- Webhooks: `src/app/api/webhooks/stripe/route.ts`
  - `checkout.session.completed`
  - `customer.subscription.updated` / `created`
  - `customer.subscription.deleted`

## Explicitly not used for Manage Plan

- `changeEmployerSubscription` / `subscriptions.update` — deprecated for UI; emergency/admin only

## Stripe Dashboard prerequisites

Customer Portal (test + live):

1. Enable **Switch plan** (subscription update)
2. Configure products/prices customers may switch between
3. Optionally configure **Manage downgrades** (immediate vs period end)
4. Enable **Cancel subscription** for Discovery path

Runtime helper `ensurePortalPlanChangeConfiguration()` will enable `subscription_update` and attach paid products if the default portal config is missing them.

Docs: https://docs.stripe.com/customer-management/portal-deep-links

## Security

- Stripe secret key stays server-side only (`STRIPE_SECRET_KEY`)
- Client receives only short-lived session URLs
- Deployed on Vercel; package manager: npm / yarn / pnpm (no bun)
