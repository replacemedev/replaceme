# Security Hardening — Manual QA Checklist

Use after deploying the 2026-07-14 DevSecOps sweep. Replace `https://replaceme.ph` with your environment.

## 1. Header verification

```bash
curl -sI https://replaceme.ph/ | grep -iE 'strict-transport|content-security|x-frame|x-content-type|referrer-policy|cross-origin-opener|cross-origin-resource'
```

Expected:

- `strict-transport-security: max-age=63072000; includeSubDomains; preload`
- `x-content-type-options: nosniff`
- `x-frame-options: SAMEORIGIN`
- `referrer-policy: strict-origin-when-cross-origin`
- `content-security-policy:` containing `default-src 'self'` and Stripe/Turnstile hosts
- `cross-origin-opener-policy: same-origin-allow-popups`

Browser: DevTools → Network → document → Response Headers. Also grade at [securityheaders.com](https://securityheaders.com).

## 2. Rate limit testing (sign-in)

Prerequisites: Redis configured (`UPSTASH_REDIS_REST_URL` + token) in the target environment.

1. Open `/signin` with a known test account.
2. Submit incorrect password **6+ times within 60 seconds** (same email).
3. Expect failure message: “Too many attempts…” (Server Action result — not always HTTP 429 for Server Actions).
4. Optional API-style check: spam `POST` to the Next.js Server Action endpoint from DevTools network replay; Upstash should reject after 5.

Edge WAF (if published):

```bash
for i in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}\n" https://replaceme.ph/signin; done
```

Expect some `429` or challenge pages after the Vercel custom rule fires.

## 3. SQLi / PostgREST filter scan

1. As admin, open Reports search (or worker job search keyword).
2. Submit payloads such as:
   - `' OR 1=1 --`
   - `%,title.eq.x`
   - `");DROP TABLE reports;--`
3. Expect: no error stack, empty/normal results, no schema disclosure.
4. Confirm DB logs show parameterized/quoted filters only (no unexpected broad SELECT).

## 4. Open redirect regression

```bash
curl -sI "https://replaceme.ph/auth/callback?code=fake&next=//evil.com"
```

Expect redirect to your site’s `/signin` with error — never `Location: //evil.com` or `https://evil.com`.

## 5. Admin MFA (AAL2)

1. Enroll TOTP for an admin.
2. Sign in without completing MFA challenge.
3. Call any admin Server Action (e.g. suspend user) via the UI — must fail / redirect to `/admin/mfa-challenge`.

## 6. WAF / DDoS dashboard (manual toggles)

### Vercel

- [ ] Project → **Firewall** enabled
- [ ] Custom rules published (match `infra/security/vercel-firewall-rules.json`)
- [ ] Know how to enable **Attack Challenge Mode** during incidents
- [ ] Enterprise: OWASP managed ruleset categories (sqli/xss/…) set to **log** first, then **deny**
- [ ] Bot Protection / BotID enabled if plan supports it
- [ ] Webhook paths `/api/webhooks/*` **not** blocked by rate rules (bypass or exclude)

### Cloudflare (only if orange-cloud proxy)

- [ ] SSL/TLS = **Full (strict)**
- [ ] Always Use HTTPS on
- [ ] Bot Fight Mode / Super Bot Fight Mode on
- [ ] Browser Integrity Check on
- [ ] WAF managed rules (OWASP) in **log**, then **block**
- [ ] Rate limit rule for `/signin` `/signup` `/forgot-password`
- [ ] Minimum TLS 1.2

## 7. Dependency / RLS CI

```bash
npm run audit
npm run check:rls
```
