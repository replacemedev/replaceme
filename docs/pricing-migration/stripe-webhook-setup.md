# Stripe Webhook Setup — Replace Me (Tailored Guide)

This guide is written specifically for **your** app on **https://replace-me-psi.vercel.app**.  
It maps every Stripe Dashboard click to what your code does in `src/app/api/webhooks/stripe/route.ts`.

Official Stripe references:
- [Receive Stripe events](https://docs.stripe.com/webhooks)
- [Add a webhook endpoint (Dashboard)](https://docs.stripe.com/development/dashboard/webhooks)
- [Fix signature verification errors](https://docs.stripe.com/webhooks/signature)

---

## 1. What the webhook does in Replace Me

When an employer pays for **Starter ($19)**, **Growth ($39)**, or **Scale ($79)**:

1. Employer clicks upgrade → your app creates a **Stripe Checkout** session (`createSubscriptionCheckoutSession`).
2. Employer pays on Stripe’s hosted page.
3. Stripe sends a **webhook** (HTTP POST) to your server.
4. Your server verifies the request is really from Stripe, then updates **`employer_subscriptions`** in Supabase.
5. Entitlements (job limits, messaging, etc.) read from that row — **not** from Stripe directly.

**Without a working webhook:** Checkout can succeed in Stripe, but the employer stays on **Discovery ($0)** in your database.

---

## 2. Your webhook URL (exact)

```
https://replace-me-psi.vercel.app/api/webhooks/stripe
```

| Check | Expected |
|-------|----------|
| Method | **POST only** (browser GET returns 405 — normal) |
| Before secrets configured | POST returns **503** `{ "error": "Webhook not configured" }` |
| After correct setup | POST with valid Stripe signature returns **200** `{ "received": true }` |

**Do not use** `stripe listen` for Vercel. That CLI tool forwards to `localhost` and gives a **different** `whsec_…` secret than the Dashboard endpoint.

---

## 3. Prerequisites (set these BEFORE testing webhooks)

In [Vercel → replace-me → Environment Variables](https://vercel.com/stephenavarra-s-projects/replace-me/settings/environment-variables) for **Production**:

| Variable | Where to get it | Why your webhook needs it |
|----------|-----------------|---------------------------|
| `STRIPE_SECRET_KEY` | [Stripe API keys (test)](https://dashboard.stripe.com/acct_1TkeHq04XnBh2V7a/test/apikeys) | Verifies signatures via `stripe.webhooks.constructEvent()` |
| `STRIPE_WEBHOOK_SECRET` | Step 6 below (`whsec_…` from **this** endpoint) | Must match the Dashboard endpoint — not CLI |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | Writes to `employer_subscriptions` + `stripe_webhook_events` |
| `NEXT_PUBLIC_SITE_URL` | `https://replace-me-psi.vercel.app` | Checkout redirects (not webhook, but same test flow) |

After adding/changing env vars → **Redeploy** the project.

---

## 4. Step-by-step: Create the webhook in Stripe Dashboard

### Step 4.1 — Confirm test mode

1. Open [Stripe Dashboard](https://dashboard.stripe.com/acct_1TkeHq04XnBh2V7a/dashboard).
2. Top-right toggle must say **Test mode** (orange/test badge).
3. Your MCP-created prices (`price_1Tmx5…`) are test-mode only.

### Step 4.2 — Open Webhooks

Go to: **Developers → Webhooks**  
Direct link: https://dashboard.stripe.com/acct_1TkeHq04XnBh2V7a/test/webhooks

(Stripe may show **Workbench** UI with “Create event destination” — same idea: add a **Webhook** destination.)

### Step 4.3 — Add endpoint

1. Click **Add endpoint** (or **Create an event destination** → choose **Webhook**).
2. **Endpoint URL** — paste exactly:
   ```
   https://replace-me-psi.vercel.app/api/webhooks/stripe
   ```
3. **Description** (optional): `Replace Me Vercel production billing sync`
4. **Listen to:** Select **Events on your account** (not Connect — you are not a Connect marketplace platform).

### Step 4.4 — Select events (only these five)

Your handler in `route.ts` only processes these. Selecting others is harmless (ignored) but adds noise.

| Event | When Stripe sends it | What your app does |
|-------|----------------------|-------------------|
| `checkout.session.completed` | Employer finishes Checkout | Loads subscription → `syncEmployerSubscriptionFromStripe` → sets plan in DB |
| `customer.subscription.created` | New subscription object exists | Same sync (backup path) |
| `customer.subscription.updated` | Plan change, renewal, cancel-at-period-end, status change | Updates `plan_slug`, `status`, billing period dates |
| `customer.subscription.deleted` | Subscription fully ended | `downgradeEmployerToDiscovery` → free tier |
| `invoice.payment_failed` | Card declined on renewal | Syncs `past_due` / inactive status to DB |

**How to select in Dashboard:**

1. Choose **Select events** (not “Send all events”).
2. Search each name above and check the box.
3. Confirm you have exactly these five (or add `payment_intent.succeeded` only if you still use legacy one-time checkout — optional).

### Step 4.5 — API version

Leave the default (Dashboard account API version). Your app uses the Stripe Node SDK bundled with Next.js — no change needed.

### Step 4.6 — Save

Click **Add endpoint** / **Create**.

---

## 5. Step-by-step: Get the signing secret

Each webhook endpoint has its **own** secret. This is how your server proves the POST came from Stripe ([docs](https://docs.stripe.com/webhooks#verify-official-libraries)).

1. Open the endpoint you just created in the Webhooks list.
2. Find **Signing secret** section.
3. Click **Reveal** (or **Click to reveal**).
4. Copy the value — it starts with `whsec_` (e.g. `whsec_abc123…`).

**Important:**  
- Dashboard `whsec_…` ≠ `stripe listen` `whsec_…` — they are different endpoints.  
- You cannot fetch this secret via API ([Stripe security policy](https://docs.stripe.com/webhooks)).

---

## 6. Step-by-step: Add secret to Vercel

1. [Vercel env vars](https://vercel.com/stephenavarra-s-projects/replace-me/settings/environment-variables)
2. Add or edit:
   - **Key:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** paste the `whsec_…` from Step 5
   - **Environment:** Production (and Preview if you want webhooks on preview URLs — usually Production only)
3. Save.
4. **Deployments** → latest production → **⋯** → **Redeploy** (required — env vars are baked in at deploy time).

---

## 7. How your code verifies each request

Flow in `src/app/api/webhooks/stripe/route.ts`:

```
Stripe POST → read raw body as text
           → read header "stripe-signature"
           → stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
           → insert event.id into stripe_webhook_events (skip duplicates)
           → handleStripeEvent() → update employer_subscriptions
           → return 200 { received: true }
```

If verification fails → **400** `Invalid signature`  
If env missing → **503** `Webhook not configured`  
If DB sync throws → **500** (Stripe will retry)

Metadata required on subscriptions (set at Checkout in `checkout-session.ts`):

- `employer_id` — Supabase profile UUID  
- `plan_id` — `billing_plans.id`  
- `plan_slug` — `starter` | `growth` | `scale`

If `employer_id` is missing, sync fails with “Missing employer metadata.”

---

## 8. Verify setup (before real money test)

### Test A — Dashboard “Send test webhook”

1. Stripe → Webhooks → your endpoint → **Send test webhook**
2. Pick event type: `checkout.session.completed`
3. Send

| Result | Meaning |
|--------|---------|
| **200** | Endpoint reachable + secret correct + handler ran |
| **503** | `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` missing on Vercel — redeploy |
| **400 Invalid signature** | Wrong `whsec_` (often copied from CLI instead of Dashboard) |
| **500 Handler failed** | Often missing `SUPABASE_SERVICE_ROLE_KEY` or test event lacks `employer_id` metadata (expected for generic test events) |

A **500 on test webhook** can be OK for `checkout.session.completed` test payloads — they don’t include your real `employer_id` metadata. A **200 on signature** (not 400/503) is the main gate.

### Test B — Real Checkout (full system test)

1. Log in as employer on https://replace-me-psi.vercel.app
2. **Account Settings** → upgrade to **Starter**
3. Pay with test card: `4242 4242 4242 4242`, any future expiry, any CVC
4. Redirect to `/employer/settings/account?checkout=success`
5. Stripe → Webhooks → your endpoint → **Recent deliveries** — should show **200** for `checkout.session.completed`
6. Supabase SQL:
   ```sql
   SELECT plan_slug, status, stripe_subscription_id
   FROM employer_subscriptions
   WHERE employer_id = '<your-employer-uuid>';
   ```
   Expect: `plan_slug = 'starter'`, `status = 'active'`

---

## 9. Monitoring & retries

- **Recent deliveries** tab on the endpoint shows every attempt, status code, and response body.
- Stripe retries failed deliveries (non-2xx) for up to ~3 days ([best practices](https://docs.stripe.com/webhooks#acknowledge-immediately)).
- Your app deduplicates via `stripe_webhook_events` — safe to receive the same `event.id` twice.

---

## 10. Troubleshooting

| Symptom | Fix |
|---------|-----|
| Paid in Checkout but still Discovery | Webhook not 200 — check Recent deliveries |
| 400 Invalid signature | Re-copy `whsec_` from **this** Dashboard endpoint; redeploy Vercel |
| 503 Webhook not configured | Add `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`; redeploy |
| 500 Missing employer metadata | Checkout must go through your app (not manual Stripe subscription) |
| 500 Plan not found | `billing_plans.stripe_price_id` must match subscription price — see `stripe-runbook.md` |
| Works in test, fails in live | Create **separate** live-mode endpoint + live `whsec_` + live API keys |

---

## 11. Checklist (copy for testing phase)

- [ ] Test mode ON in Stripe  
- [ ] Endpoint URL: `https://replace-me-psi.vercel.app/api/webhooks/stripe`  
- [ ] Five events selected (§4.4)  
- [ ] `STRIPE_SECRET_KEY` on Vercel  
- [ ] `STRIPE_WEBHOOK_SECRET` on Vercel (Dashboard `whsec_`)  
- [ ] `SUPABASE_SERVICE_ROLE_KEY` on Vercel  
- [ ] `NEXT_PUBLIC_SITE_URL=https://replace-me-psi.vercel.app`  
- [ ] Production redeployed  
- [ ] Test webhook ≠ 400/503  
- [ ] Real Starter checkout → `plan_slug = starter` in DB  

---

**Next:** Customer Portal setup → [`stripe-vercel-setup.md`](./stripe-vercel-setup.md) Step 3.  
**Test matrix:** [`testing-report.md`](./testing-report.md)
