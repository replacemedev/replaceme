# DPA & subprocessors

**Audience:** Legal + Ops  
**Last updated:** 2026-07-14  
**Public list:** `/subprocessors` (footer link)

## Executed DPAs (ops checklist)

Mark when countersigned agreements are on file (shared drive / contract system). Engineering does not store PDF agreements in git.

| Processor | Purpose | Vendor DPA URL | On file? | Owner | Notes |
|-----------|---------|----------------|----------|-------|-------|
| **Supabase** | DB, Auth, Storage | https://supabase.com/legal/dpa | ☐ | Legal | Confirm project region matches residency plan |
| **Stripe** | Payments | https://stripe.com/legal/dpa | ☐ | Legal | Also PCI / DTA artifacts |
| **Resend** | Email | https://resend.com/legal/dpa | ☐ | Legal | |
| **Upstash** | Redis rate limits | https://upstash.com/legal/dpa | ☐ | Legal | |
| **Vercel** | Hosting | https://vercel.com/legal/dpa | ☐ | Legal | |
| **Cloudflare** | Turnstile / WAF | https://www.cloudflare.com/cloudflare-customer-dpa/ | ☐ | Legal | If used beyond Turnstile |
| **Sentry** (optional) | Error monitoring | https://sentry.io/legal/dpa/ | ☐ | Legal | Only if `NEXT_PUBLIC_SENTRY_DSN` enabled |

## Subprocessor publication

- Public page: `src/app/(public)/subprocessors/page.tsx`
- Keep table in `SubprocessorsContent` aligned with this checklist when vendors change.
- Material changes: update page `lastUpdated`, notify enterprise DPA customers per contract.

## Transfer / residency notes

Document chosen Supabase + Upstash + Vercel regions in the Ops wiki. Link from privacy policy; do not invent residency claims without confirmation.
