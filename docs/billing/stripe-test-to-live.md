# Stripe test → live go-live playbook

**Status:** Ops checklist (2026-07-27)  
**Scope:** Employer plan subscriptions only (not worker payouts).  
**Gate:** Finish [sandbox-subscription-sync-qa.md](./sandbox-subscription-sync-qa.md) before any live work.

## Current sandbox snapshot (verified)

| Layer | Value |
| --- | --- |
| Stripe MCP / account | `Replace Me sandbox` (`acct_1TkeHq04XnBh2V7a`) — **keep MCP here until go-live day** |
| Supabase project | `https://dsbfudkacjrpnilqmiuy.supabase.co` |
| Sandbox webhook | `https://replace-me-psi.vercel.app/api/webhooks/stripe` (test mode, enabled) |
| Live webhook (not created yet) | `https://replaceme.ph/api/webhooks/stripe` |

### `billing_plans` ↔ sandbox prices (aligned)

| Slug | USD | `stripe_price_id` | `stripe_product_id` |
| --- | --- | --- | --- |
| discovery | 0 | — | — |
| starter | 19 | `price_1Tmx5S04XnBh2V7aYe5kFp8R` | `prod_UmW7J2RzVLIejM` |
| growth | 39 | `price_1Tmx5S04XnBh2V7aaJdEfLUc` | `prod_UmW71PBiBAfnD5` |
| scale | 79 | `price_1Tmx5V04XnBh2V7aGr4n1Ion` | `prod_UmW7Y9bQq0jFlA` |

All three prices: `livemode=false`, monthly USD, amounts correct.  

**Sandbox Tax (MCP applied 2026-07-27):**
- Tax defaults: `tax_behavior=exclusive`, preset `tax_code=txcd_10103001` (SaaS Business Use)
- Products Starter/Growth/Scale: `tax_code=txcd_10103001`
- Prices: `tax_behavior=exclusive`
- **Still manual:** set sandbox [Tax head office](https://dashboard.stripe.com/settings/tax) (AU address). Status stays `pending` until `head_office` is set.

---

## MCP sandbox ↔ live switching

Do **not** leave MCP on live while iterating. There is no in-chat toggle.

| When | MCP target |
| --- | --- |
| Now → sandbox QA | **Sandbox** (current) |
| Go-live setup day | **Live** (re-auth OAuth) |
| After live is green | Prefer **sandbox** again |

**Switch steps**

1. Stripe Dashboard → [User settings → OAuth sessions](https://dashboard.stripe.com/settings/user) → revoke Stripe MCP session  
2. Cursor → reconnect Stripe MCP → pick sandbox **or** live in consent  
3. First call: `get_stripe_account_info` — confirm `display_name`  
4. Optional: dual MCP entries `stripe-sandbox` / `stripe-live` (same URL `https://mcp.stripe.com`)

MCP mode ≠ Vercel mode. App uses Preview `sk_test_` vs Production `sk_live_`.

---

## MCP vs manual

| Layer | MCP can help | Manual |
| --- | --- | --- |
| Stripe | Products/prices, webhooks, refunds, docs | KYC, 2FA, bank, branding, ATO GST, Radar, emails, statement descriptor |
| Vercel | Deployments/logs | Sensitive prod env, redeploy, domain HTTPS |
| Supabase | `execute_sql` if on prod project | Confirm prod project; UPDATE live price IDs; never put secrets in SQL |

---

## Manual A — Stripe Dashboard (live)

Toggle **off** test data.

### A1. Activate

- [ ] 2FA (passkey preferred)
- [ ] [Onboarding](https://dashboard.stripe.com/account/onboarding): AU entity, identity
- [ ] Origin country **Australia** (immutable after activation)
- [ ] `charges_enabled` + `payouts_enabled`

### A2. Public info

- [ ] [Public details](https://dashboard.stripe.com/settings/public): name, `https://replaceme.ph`, `support@replaceme.ph`
- [ ] Statement descriptor 5–22 chars
- [ ] Privacy + support URLs

### A3. Bank

- [ ] [Payouts](https://dashboard.stripe.com/settings/payouts): AU bank, schedule

### A4. Branding / emails / Checkout legal

- [ ] [Branding](https://dashboard.stripe.com/settings/branding)
- [ ] [Customer emails](https://dashboard.stripe.com/settings/emails)
- [ ] [Checkout settings](https://dashboard.stripe.com/settings/checkout): Terms `/terms-of-service`, Privacy `/privacy-policy`, Refund `/refund-policy`

### A5. Live catalog

- [ ] Products Starter / Growth / Scale
- [ ] Prices $19 / $39 / $79 monthly USD, `tax_behavior=exclusive`
- [ ] Product tax code = SaaS Business Use `txcd_10103001`
- [ ] Record live `prod_` / `price_` IDs

### A6. Stripe Tax

- [ ] [Tax](https://dashboard.stripe.com/settings/tax): AU head office, prices **exclude** tax
- [ ] AU GST registration when ATO requires
- [ ] See [stripe-tax-au-merchant.md](./stripe-tax-au-merchant.md)

### A7. Customer Portal (live)

- [ ] [Portal](https://dashboard.stripe.com/settings/billing/portal) in live — or first Manage Plan triggers app upsert
- [ ] Switch plan, cancel at period end, payment method, invoices
- [ ] Attach all three paid prices

### A8. Live webhook

- [ ] URL: `https://replaceme.ph/api/webhooks/stripe`
- [ ] Events: same as sandbox QA doc (+ `subscription_schedule.*`)
- [ ] Copy live `whsec_` → Vercel only

### A9–A10. Radar / keys

- [ ] Radar defaults; team least privilege
- [ ] `sk_live_` → Vercel Sensitive only (never git)

---

## Manual B — Vercel production

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...   # LIVE endpoint
STRIPE_AUTOMATIC_TAX=true         # remove false from prod
# optional:
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_GROWTH=price_...
STRIPE_PRICE_SCALE=price_...
NEXT_PUBLIC_SITE_URL=https://replaceme.ph
```

- [ ] Preview stays on `sk_test_`
- [ ] Production domain `replaceme.ph` HTTPS valid
- [ ] Redeploy after env change

```bash
vercel env add STRIPE_SECRET_KEY production --sensitive
vercel env add STRIPE_WEBHOOK_SECRET production --sensitive
vercel --prod
```

---

## Manual C — Supabase production

Confirm project URL first. Then:

```sql
UPDATE public.billing_plans
SET stripe_product_id = 'prod_LIVE_STARTER',
    stripe_price_id = 'price_LIVE_STARTER'
WHERE slug = 'starter';
-- repeat for growth / scale
```

Do **not** commit `sk_live` / `whsec` in migrations.

---

## Legal / ops

- [ ] Set `BILLING_MERCHANT.abn` in `src/lib/data/legal.ts` when issued
- [ ] Counsel: ToS §6, Refund Policy, §12
- [ ] Accountant: ATO GST + optional BIR

---

## Live smoke

1. Real card Starter Checkout  
2. Webhook `mode=live` + DB `plan_slug=starter`  
3. Portal upgrade / cancel  
4. Optional refund  
5. Monitor 48h

---

## Agent prompt (live day only)

Paste into a new Agent chat **after** KYC is done and MCP is re-authed to **live**:

```
Goal: Configure Stripe LIVE for Replaceme employer subscriptions.
Follow docs/billing/stripe-test-to-live.md.
Confirm get_stripe_account_info is LIVE (not sandbox) before writes.
Create products/prices $19/$39/$79 exclusive + SaaS tax code.
Create webhook https://replaceme.ph/api/webhooks/stripe with sandbox QA events.
Output SQL for billing_plans + Vercel env list.
Do NOT use test price IDs. Do NOT store secrets in git.
```

---

## Execution order

1. Sandbox QA green  
2. Manual A (activate + catalog + Tax + Portal + webhook)  
3. Manual B (Vercel)  
4. Manual C (Supabase live IDs)  
5. ABN + counsel  
6. Live smoke + optional refund  
