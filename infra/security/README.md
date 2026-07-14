# Security infrastructure — WAF & DDoS

Application-layer controls (CSP, Upstash rate limits, Turnstile, RLS) live in the Next.js app.
Edge controls are configured in the hosting / CDN dashboards using the artifacts in this folder.

## Files

| File | Purpose |
|------|---------|
| `vercel-firewall-rules.json` | Reference custom rules for Vercel Firewall (auth + API rate limits) |
| `cloudflare-waf.tf` | Optional Cloudflare OWASP + auth rate-limit Terraform |

## Apply (Vercel)

1. Open **Project → Firewall**.
2. Enable **Attack Challenge Mode** during incidents (`vercel firewall attack-mode enable`).
3. Add custom rules matching `vercel-firewall-rules.json` (or CLI `vercel firewall rules add …`).
4. Enterprise: enable **Managed Rulesets → OWASP** (SQLi/XSS deny; start with log, then deny).
5. Enable **Bot Protection** / BotID if available on the plan.
6. Publish staged firewall changes.

## Apply (Cloudflare)

Only if DNS is proxied through Cloudflare in front of Vercel:

1. Set SSL/TLS mode to **Full (strict)**.
2. Enable **Bot Fight Mode** and **Browser Integrity Check**.
3. `terraform apply` against `cloudflare-waf.tf` (tune expressions first in log mode).
4. Keep Super Bot Fight Mode on **Managed Challenge** initially to reduce false positives for legitimate crawlers you allow in `robots.ts`.

## Defence in depth

```
Internet → Cloudflare (optional) → Vercel Firewall / WAF → Next.js proxy (auth/session)
        → Server Actions (Zod + Upstash) → Supabase (RLS)
```
