# Stripe on Vercel — `https://replace-me-psi.vercel.app`

Use this guide when **not** using localhost. MCP already created test-mode products/prices and synced Supabase — see [`stripe-setup.md`](./stripe-setup.md) for IDs.

**Vercel project:** `replace-me` (`prj_fdvtchTjX1G6DcW6ULJ02azgbHAL`)  
**Production URL:** https://replace-me-psi.vercel.app  
**Webhook route (verified live):** `POST https://replace-me-psi.vercel.app/api/webhooks/stripe`

---

## Already done (MCP — no action needed)

| Item | Status |
|------|--------|
| Stripe products (Starter / Growth / Scale) | ✅ Test mode |
| Monthly prices $19 / $39 / $79 | ✅ |
| `billing_plans.stripe_*` in Supabase | ✅ |
| Webhook handler in app | ✅ Deployed (returns 405 on GET, 503 until secrets set) |

**Discovery ($0)** has no Stripe product — handled in-app only.

---

## Manual steps (you must do these)

### Step 1 — Vercel environment variables

Open: [Vercel → replace-me → Settings → Environment Variables](https://vercel.com/stephenavarra-s-projects/replace-me/settings/environment-variables)

Add or update for **Production** (and **Preview** if you test on preview URLs):

| Variable | Value | Notes |
|----------|--------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://replace-me-psi.vercel.app` | **Required** — Checkout success/cancel, Portal return, auth links |
| `STRIPE_SECRET_KEY` | `sk_test_…` | [Stripe API keys (test)](https://dashboard.stripe.com/acct_1TkeHq04XnBh2V7a/test/apikeys) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_…` | Same page |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` | From **Step 2** (not from `stripe listen`) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ…` | Webhook sync + billing (server only) |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | Already set if app works |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | Already set |

Optional overrides (DB already has price IDs):

```bash
STRIPE_PRICE_STARTER=price_1Tmx5S04XnBh2V7aYe5kFp8R
STRIPE_PRICE_GROWTH=price_1Tmx5S04XnBh2V7aaJdEfLUc
STRIPE_PRICE_SCALE=price_1Tmx5V04XnBh2V7aGr4n1Ion
```

**Do not set** `E2E_SEED_ENABLED=1` on Production.

After saving env vars → **Redeploy** (Deployments → ⋯ → Redeploy) so functions pick up new values.

**Local `.env.local`** (for dev against the same Stripe account):

```bash
NEXT_PUBLIC_SITE_URL=https://replace-me-psi.vercel.app
# …same Stripe + Supabase keys as Vercel
```

Using the Vercel URL locally ensures Checkout redirects back to the deployed site when testing from your machine.

---

### Step 2 — Stripe webhook (Vercel endpoint)

**Do not use** `stripe listen` for this setup — that is localhost-only.

1. Open [Stripe → Developers → Webhooks (test mode)](https://dashboard.stripe.com/acct_1TkeHq04XnBh2V7a/test/webhooks).
2. **Add endpoint**
3. **Endpoint URL:**

   ```
   https://replace-me-psi.vercel.app/api/webhooks/stripe
   ```

4. **Select events:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

5. Create endpoint → open it → **Reveal** signing secret (`whsec_…`).
6. Paste into Vercel as `STRIPE_WEBHOOK_SECRET` (Step 1).
7. Redeploy Vercel.

**Verify:** In Stripe → Webhooks → your endpoint → **Send test webhook** → `checkout.session.completed`. Expect **200** (not 503/400).

| Response | Meaning |
|----------|---------|
| `503 Webhook not configured` | Missing `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` on Vercel |
| `400 Invalid signature` | Wrong `STRIPE_WEBHOOK_SECRET` (e.g. copied from `stripe listen` instead of Dashboard) |
| `200 { "received": true }` | ✅ |

---

### Step 3 — Customer Billing Portal

1. [Settings → Billing → Customer portal (test)](https://dashboard.stripe.com/settings/billing/portal)
2. **Activate** portal.
3. Under **Products**, allow switching between:
   - Replace Me Starter  
   - Replace Me Growth  
   - Replace Me Scale  
4. Enable **Cancel subscription** (at period end).
5. Enable **Update payment methods** and **Invoice history**.
6. Save.

Portal return URL is set in code to:

`https://replace-me-psi.vercel.app/employer/settings/account`

(uses `NEXT_PUBLIC_SITE_URL` — Step 1 must be correct.)

---

### Step 4 — Supabase auth redirect URLs

So employer signup/login and email links work on the Vercel domain:

1. [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **URL Configuration**
2. **Site URL:** `https://replace-me-psi.vercel.app`
3. **Redirect URLs** — add:
   ```
   https://replace-me-psi.vercel.app/**
   https://replace-me-psi.vercel.app/auth/callback
   https://replace-me-psi.vercel.app/auth/confirm
   ```
4. Save.

---

### Step 5 — End-to-end checkout test (on Vercel)

1. Go to https://replace-me-psi.vercel.app and sign in as an employer (Discovery tier).
2. **Account Settings** or **Pricing** → upgrade to **Starter** ($19).
3. Stripe Checkout opens → pay with `4242 4242 4242 4242`, any future date, any CVC.
4. Redirect should land on:
   `https://replace-me-psi.vercel.app/employer/settings/account?checkout=success`
5. Confirm in Stripe Dashboard → **Customers** → subscription on `price_1Tmx5S04XnBh2V7aYe5kFp8R`.
6. Confirm in Supabase:

```sql
SELECT plan_slug, status, stripe_customer_id, stripe_subscription_id
FROM employer_subscriptions
WHERE employer_id = '<your-employer-uuid>';
```

7. Click **Manage billing** → Stripe Customer Portal opens.

---

### Step 6 — Business & branding (recommended)

| Task | Where |
|------|--------|
| Business name / support email | Stripe → Settings → Business |
| Statement descriptor | Settings → Payments |
| Logo on Checkout | Settings → Branding |
| Customer emails | Settings → Emails |

---

### Step 7 — Preview deployments (optional)

If you test on URLs like `replace-me-git-main-….vercel.app`:

- Either set `NEXT_PUBLIC_SITE_URL` per-preview (not typical), **or**
- Run billing tests only on **https://replace-me-psi.vercel.app** so Checkout/Portal return URLs stay consistent.
- Create a **second Stripe webhook** for preview URLs only if you need automated preview testing (usually unnecessary).

---

## Checkout & redirect URLs (reference)

With `NEXT_PUBLIC_SITE_URL=https://replace-me-psi.vercel.app`:

| Flow | URL |
|------|-----|
| Checkout success | `/employer/settings/account?checkout=success` |
| Checkout cancel | `/employer/pricing?checkout=canceled` |
| Portal return | `/employer/settings/account` |
| Webhook | `/api/webhooks/stripe` |

---

## Pricing tiers ↔ Stripe (test mode)

| Tier | Price | Stripe price ID |
|------|-------|-----------------|
| Discovery | $0 | — (no Stripe) |
| Starter | $19/mo | `price_1Tmx5S04XnBh2V7aYe5kFp8R` |
| Growth | $39/mo | `price_1Tmx5S04XnBh2V7aaJdEfLUc` |
| Scale | $79/mo | `price_1Tmx5V04XnBh2V7aGr4n1Ion` |

---

## What MCP cannot configure

| Item | You configure in |
|------|------------------|
| Vercel env vars | Vercel Dashboard (Step 1) |
| Stripe webhook endpoint URL | Stripe Dashboard (Step 2) |
| Webhook signing secret → Vercel | Copy manually after Step 2 |
| Customer Portal UI/settings | Stripe Dashboard (Step 3) |
| Supabase redirect URLs | Supabase Dashboard (Step 4) |
| Redeploy after env change | Vercel Deployments |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Checkout redirects to `localhost` | Set `NEXT_PUBLIC_SITE_URL` on Vercel + redeploy |
| Plan not updating after payment | Webhook secret / events (Step 2); check Vercel function logs |
| Portal error | Activate portal + add products (Step 3) |
| Public site four-tier pricing | ✅ | Homepage + `/pricing` from `billing_plans`; CMS FAQs migrated |

---

**Next:** After Steps 1–4 + redeploy, run Layer **6T** Playwright against `https://replace-me-psi.vercel.app` (or re-seed + test locally with the same env).
