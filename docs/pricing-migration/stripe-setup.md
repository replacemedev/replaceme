# Stripe Setup — Pricing v2 (Replace Me)

**Account:** Replace Me sandbox (`acct_1TkeHq04XnBh2V7a`) — **Test mode**  
**API keys:** [Stripe Dashboard → API keys](https://dashboard.stripe.com/acct_1TkeHq04XnBh2V7a/apikeys)

---

## What Stripe MCP already did (automated)

These steps were completed via **Stripe MCP** + **Supabase MCP** on 2026-06-26.

### 1. Products created (test mode)

| Slug | Product name | Product ID | Monthly price | Price ID | Lookup key |
|------|--------------|------------|---------------|----------|------------|
| **starter** | Replace Me Starter | `prod_UmW7J2RzVLIejM` | **$19/mo** | `price_1Tmx5S04XnBh2V7aYe5kFp8R` | `replaceme_starter_monthly` |
| **growth** | Replace Me Growth | `prod_UmW71PBiBAfnD5` | **$39/mo** | `price_1Tmx5S04XnBh2V7aaJdEfLUc` | `replaceme_growth_monthly` |
| **scale** | Replace Me Scale | `prod_UmW7Y9bQq0jFlA` | **$79/mo** | `price_1Tmx5V04XnBh2V7aGr4n1Ion` | `replaceme_scale_monthly` |

Each product has `metadata.plan_slug` and `metadata.plan_id` (Supabase `billing_plans.id`).  
Each price is **recurring monthly USD**, `usage_type: licensed`.

### 2. Discovery (free) — intentionally no Stripe product

Discovery ($0) is **not** a Stripe subscription. Employers stay on Discovery in Supabase until they upgrade via Checkout. Checkout blocks `discovery` in `createSubscriptionCheckoutSession`.

### 3. Supabase `billing_plans` synced

`stripe_product_id` and `stripe_price_id` are set for starter, growth, and scale. Discovery rows have `NULL` Stripe IDs.

Verify anytime:

```sql
SELECT slug, price, stripe_product_id, stripe_price_id
FROM billing_plans
ORDER BY display_order;
```

### 4. Default prices set on products

Stripe default price on each product matches the monthly price above (used by Portal / Pricing tables if enabled).

---

## What you must do manually (not in Stripe MCP)

Stripe MCP **cannot** configure webhooks, Customer Portal, dashboard business settings, or copy secrets into your app. Follow these in order.

---

### Step 1 — Copy API keys into environment

1. Open [API keys (test mode)](https://dashboard.stripe.com/acct_1TkeHq04XnBh2V7a/test/apikeys).
2. Add to **`.env.local`** (local) and **Vercel → Project → Settings → Environment Variables** (preview + production when ready):

```bash
# Test mode keys (sk_test_… / pk_test_…)
STRIPE_SECRET_KEY=sk_test_xxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxx

# Filled in Step 2 or 3 below
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx

# Optional overrides (DB already has price IDs; use if you rotate prices)
STRIPE_PRICE_STARTER=price_1Tmx5S04XnBh2V7aYe5kFp8R
STRIPE_PRICE_GROWTH=price_1Tmx5S04XnBh2V7aaJdEfLUc
STRIPE_PRICE_SCALE=price_1Tmx5V04XnBh2V7aGr4n1Ion
```

Also required for webhooks (already in app):

```bash
SUPABASE_SERVICE_ROLE_KEY=...
```

Restart dev server after changing env.

---

### Step 2 — Webhook endpoint (local development)

1. Install Stripe CLI: https://docs.stripe.com/stripe-cli  
2. Login: `stripe login`  
3. Forward events to your app:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

4. Copy the printed **`whsec_…`** into `STRIPE_WEBHOOK_SECRET` in `.env.local`.  
5. Keep `stripe listen` running while testing checkout.

**Required events** (app handler in `src/app/api/webhooks/stripe/route.ts`):

| Event | Purpose |
|-------|---------|
| `checkout.session.completed` | Activate plan after Checkout |
| `customer.subscription.created` | Sync new subscription |
| `customer.subscription.updated` | Plan change, renewals, past_due |
| `customer.subscription.deleted` | Downgrade to Discovery |
| `invoice.payment_failed` | Sync past_due status |

Optional legacy: `payment_intent.succeeded` (old one-time flow).

---

### Step 3 — Webhook endpoint (staging / production)

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**  
2. URL: `https://<your-domain>/api/webhooks/stripe`  
3. Select the five events listed above.  
4. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET` in Vercel (per environment).  
5. Deploy with `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` for that mode (test vs live).

**Idempotency:** App uses `stripe_webhook_events` — duplicate deliveries are safe.

---

### Step 4 — Customer Billing Portal

Required for **Manage billing** on `/employer/settings/account`.

1. Dashboard → **Settings → Billing → Customer portal**  
   Direct link: https://dashboard.stripe.com/settings/billing/portal  
2. **Activate** the portal (test mode first).  
3. **Products:** Allow customers to switch plans — add all three paid products:
   - Replace Me Starter  
   - Replace Me Growth  
   - Replace Me Scale  
4. **Subscriptions:** Enable cancel at period end (matches app `cancelSubscription`).  
5. **Payment methods:** Allow update.  
6. **Invoices:** Show history (recommended).  
7. Save. Return URL is set in code: `/employer/settings/account`.

---

### Step 5 — Checkout smoke test (employer)

1. Seed or use a Starter-tier test employer.  
2. Log in → **Account Settings** or **Pricing** → upgrade to Starter.  
3. Checkout with test card **`4242 4242 4242 4242`**, any future expiry, any CVC.  
4. Confirm redirect to `/employer/settings/account?checkout=success`.  
5. Verify in Supabase:

```sql
SELECT employer_id, plan_slug, status, stripe_customer_id, stripe_subscription_id
FROM employer_subscriptions
WHERE employer_id = '<employer-uuid>';
```

6. Stripe Dashboard → **Customers** → subscription should show correct price.

**Decline test:** `4000 0000 0000 0002`

---

### Step 6 — Portal smoke test

1. From Account Settings, click **Manage billing**.  
2. Portal opens; confirm plan name and amount match.  
3. Optional: switch Growth ↔ Scale; webhook should update `employer_subscriptions.plan_slug`.

---

### Step 7 — Business settings (recommended before live)

| Setting | Where | Recommendation |
|---------|--------|----------------|
| Business name & support email | Settings → Business | Shown on receipts |
| Statement descriptor | Settings → Payments → Statement descriptor | Short name on card statements |
| Branding | Settings → Branding | Logo on Checkout / Portal |
| Tax | Settings → Tax | Enable Stripe Tax if you sell in taxable regions |
| Emails | Settings → Emails | Customer receipts & failed payment emails |

---

### Step 8 — Go live (when ready)

MCP created **test mode** objects only (`livemode: false`). For production:

1. Toggle Dashboard to **Live mode**.  
2. **Recreate** the three products + monthly prices (same names, $19 / $39 / $79) — or use Stripe MCP again against live keys.  
3. Update **live** `billing_plans.stripe_*` IDs in Supabase (or run the same SQL with live IDs).  
4. Create a **live** webhook endpoint + live API keys in Vercel.  
5. Re-run Customer Portal config in **live** mode.  
6. Do **not** reuse test `price_` IDs in production Checkout.

---

## App integration map

| Flow | Code path |
|------|-----------|
| Upgrade Checkout | `createSubscriptionCheckoutSession` → `resolveCheckoutLineItem` uses `billing_plans.stripe_price_id` |
| Webhook sync | `/api/webhooks/stripe` → `syncEmployerSubscriptionFromStripe` |
| Plan resolution | Subscription metadata `employer_id`, `plan_id`, `plan_slug` **or** price ID lookup |
| Customer Portal | `createBillingPortalSession` → return URL account settings |
| Entitlements | Supabase plan slug — **not** Stripe directly (Stripe only changes subscription row) |

---

## Tier ↔ Stripe mapping (reference)

| Tier | Price | Stripe | Entitlements (Supabase) |
|------|-------|--------|-------------------------|
| Discovery | $0 | None | 1 job, 10 applicants, 2-day approval, preview only |
| Starter | $19/mo | `price_1Tmx5S04XnBh2V7aYe5kFp8R` | 3 jobs, 20 applicants, full identity, messaging |
| Growth | $39/mo | `price_1Tmx5S04XnBh2V7aaJdEfLUc` | 10 jobs, 50 applicants, priority listing |
| Scale | $79/mo | `price_1Tmx5V04XnBh2V7aGr4n1Ion` | Unlimited jobs & applicants |

---

## Stripe MCP capabilities used

| MCP tool | Used for |
|----------|----------|
| `get_stripe_account_info` | Account ID + API keys link |
| `stripe_api_search` / `stripe_api_details` | Find create product/price operations |
| `stripe_api_write` (`PostProducts`, `PostPrices`, `PostProductsId`) | Create products, prices, set default price |
| `search_stripe_resources` | Confirm no duplicate products |
| Supabase `apply_migration` | Persist IDs to `billing_plans` |

**Not available in MCP:** webhook endpoints, portal configuration, API key export, `stripe listen`, Vercel env, live-mode product clone, tax/branding dashboards.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| “Stripe is not configured” | Set `STRIPE_SECRET_KEY` |
| Checkout works but plan unchanged | Webhook secret wrong or `stripe listen` not running |
| “Missing employer metadata” | Checkout sets metadata — ensure upgrade via app, not manual Stripe subscription |
| Portal 404 / error | Activate Customer Portal (Step 4) |
| Wrong plan after upgrade | Check `billing_plans.stripe_price_id` matches Stripe price on subscription |

---

**Next:** After Steps 1–4, proceed to Layer **6T** Playwright (re-seed E2E fixtures first).
