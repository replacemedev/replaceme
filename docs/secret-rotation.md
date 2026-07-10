# Secret rotation runbook

Rotate credentials on a schedule and after any suspected leak. Prefer rotating one secret at a time and verifying the app before the next.

## Cadence

| Secret | Suggested cadence | Where |
|--------|-------------------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` | On leak / project rotate | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | With project API rotate | Same (anon is public; still rotate if leaked with service role) |
| `STRIPE_SECRET_KEY` / webhook secret | 90 days or on leak | Stripe Dashboard → Developers |
| `RESEND_API_KEY` / webhook secret | 90 days or on leak | Resend dashboard |
| `TURNSTILE_SECRET_KEY` | On leak / widget recreate | Cloudflare Turnstile |
| `UPSTASH_REDIS_REST_TOKEN` | 90 days or on leak | Upstash console |
| `CRON_SECRET` | 90 days | Generate new random; update Vercel cron + env |

## Steps (generic)

1. Generate / roll the new secret in the provider dashboard.
2. Set the new value in Vercel (Production + Preview) **before** disabling the old one when dual-key is supported; otherwise deploy immediately after update.
3. Redeploy / wait for env propagation.
4. Smoke-test: auth login, checkout (Stripe), email send, rate-limited action, cron Bearer call.
5. Revoke the old secret in the provider.
6. Record rotation date in your ops log.

## CSRF model (intentional)

- Browser mutations use **Next.js Server Actions** (Origin checks built-in).
- Session cookies are httpOnly via `@supabase/ssr` (SameSite=Lax).
- Cron and webhooks use shared secrets / signature verification — not cookie CSRF.
- No extra CSRF tokens are required for this architecture.

## Production must-haves

- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` set (rate limits fail closed without them).
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` **and** `TURNSTILE_SECRET_KEY` set in Vercel (Production + Preview).
  Without the secret, the app still accepts a widget token (presence) and passes it to Supabase as `captchaToken`, but Cloudflare Siteverify is skipped — add the secret ASAP.
- HTTPS only; HSTS is set in `next.config.ts`.
- Optionally enable Supabase Auth CAPTCHA (Turnstile) in the Supabase dashboard as defense-in-depth.
