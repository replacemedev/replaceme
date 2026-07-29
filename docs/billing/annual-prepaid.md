# Annual prepaid billing (sandbox)

**Status:** Implemented (2026-07-30)  
**Model:** Annual = Stripe `recurring.interval=year` (one charge per year). UI shows monthly equivalent + total due today.

## Amounts

| Plan | Monthly | Annual display | Charge once/year | Save |
|------|--------:|---------------:|-----------------:|-----:|
| Starter | $19/mo | $13/mo | $156 | 32% |
| Growth | $39/mo | $26/mo | $312 | 33% |
| Scale | $79/mo | $52/mo | $624 | 34% |

## Schema

- `billing_plans.price` — monthly USD
- `billing_plans.annual_price` — yearly prepaid USD
- `billing_plans.stripe_price_id` — monthly Price
- `billing_plans.stripe_price_id_yearly` — yearly Price

## UX / compliance (ACL-aligned)

- Pricing toggle defaults to **Annual**
- Cards always show **$/mo**; annual also shows **Billed annually at $X/year**
- Checkout shows **Total due today** for annual
- ToS §5 + Refund Policy: auto-renewal, cancel online, period-end access, non-refundable commenced B2B periods
- Prepare for AU UTP subscription rules (from 1 Jul 2027): disclosure, renewals, easy cancel

## QA

1. Pricing page defaults to Annual → Starter shows $13/mo + Save 32% + $156/year
2. Checkout `?interval=year` → Stripe line item yearly price
3. Webhook sets `employer_subscriptions.billing_interval=year`
4. Admin billing: Year badge + `$156/yr`; MRR ≈ $13
5. Toggle Monthly → checkout monthly price
6. Portal catalog includes both monthly and yearly prices
