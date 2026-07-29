# Stripe Tax — Australian merchant of record

**Status:** Implemented (2026-07-27)  
**Scope:** Employer **plan** subscriptions only (not worker payouts).

## Product rules

| Concept | Owner |
| --- | --- |
| Plan price (USD) | Replaceme (AU merchant) |
| Stripe processing fee | Stripe |
| GST / VAT / sales tax on invoice | **Government** (collected via Stripe Tax; you remit) |

List prices stay **tax-exclusive**. Do **not** hardcode Philippine 12% VAT as if Replaceme were a PH seller of every plan.

## Checkout code

`src/lib/server/stripe/checkout-session.ts` enables (when `STRIPE_AUTOMATIC_TAX` is not `"false"`):

- `automatic_tax: { enabled: true }`
- `billing_address_collection: "required"`
- `tax_id_collection: { enabled: true }`
- `customer_update: { address: "auto", name: "auto" }`

Sandbox without Tax activated: set `STRIPE_AUTOMATIC_TAX=false` so Checkout still works (billing address still required).

## Stripe Dashboard (ops)

1. Set business / tax origin to **Australia**.
2. Activate **Stripe Tax**.
3. Register AU GST with the ATO when required; enable AU collection in Tax settings.
4. Add other jurisdictions only when thresholds require registration.
5. Ensure Products/Prices used for Starter/Growth/Scale are Tax-compatible (tax code for SaaS digital service).

## Expected buyer outcomes (typical)

| Buyer | Likely Checkout tax |
| --- | --- |
| AU consumer (no ABN) | ~10% AU GST (once registered) |
| AU business (valid ABN) | Often $0 GST charged (reverse charge) |
| US / most overseas employers | Often $0 AU GST (export) |
| PH B2B employer | Usually reverse charge on buyer side; no hardcoded PH VAT in app |

## Legal surfaces

- ToS §6.1–6.6, §12 — AU MoR + softened chargeback language
- `/refund-policy` — policy 1B (no 30-day MBG)
- Footer + pricing FAQ + help billing guide

## QA matrix

| Case | Steps | Expect |
| --- | --- | --- |
| US employer first paid | Pricing → Checkout | Tax line $0 or destination-only if registered; session succeeds |
| AU consumer test | Checkout with AU address, no ABN | GST appears when Tax+ATO configured |
| AU business + ABN | Tax ID at Checkout | No GST charged (typical) |
| Portal upgrade | Active sub → Manage plan | Portal confirm; webhook syncs tier |
| Cancel | Cancel → Discovery | Period-end; no partial refund claim |
| Invoice UI | Account → invoices | Tax sub-line when `taxAmount > 0` |
| Safari iOS | Pricing → Checkout CTA | Hosted Stripe redirect works; min touch targets |

Docs: https://docs.stripe.com/tax/checkout
