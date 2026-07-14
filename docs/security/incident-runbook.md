# Security incident runbook

**Audience:** Engineering + Ops on-call  
**Last updated:** 2026-07-14  
**Product:** Replaceme (`01_replace_me`)

## Purpose

Who does what, when, during a suspected or confirmed security incident (account takeover, data exposure, payment fraud, widespread abuse, dependency compromise).

## Severity

| Level | Examples | Response target |
|-------|----------|-----------------|
| **SEV-1** | Confirmed PII dump, payment skimming, auth bypass in production | Acknowledge ≤15 min; contain ≤1 h |
| **SEV-2** | Credential leak (service role / webhook secret), active spam/abuse wave | Acknowledge ≤1 h; contain ≤4 h |
| **SEV-3** | Single-user compromise, suspected probing, CSP noise spike | Same business day |

## Roles

| Role | Responsibility |
|------|----------------|
| **Incident lead** | Owns timeline, decisions, status updates |
| **Eng responder** | Containment patches, log review, deploy |
| **Ops / platform** | Secrets rotation, WAF / Attack Challenge Mode, maint window |
| **Comms / legal** | User notice, regulator consult (NPC/GDPR when applicable) |

Fill primary contacts in your password manager / Ops wiki (do not commit personal phones here).

## Detection sources

- Sentry (`NEXT_PUBLIC_SENTRY_DSN`) — unexpected error / spike
- `/api/health` uptime monitor — degraded Supabase / process down
- Stripe / Resend webhook failures or unusual volume
- Admin `audit_logs` — suspicious suspend / billing / CMS edits
- Abuse reports (`/admin/reports`) — see `abuse-reporting-slas.md`
- CSP reports → `/api/csp-report` (logged via `safeWarn`)

## Immediate containment checklist

1. **Preserve evidence** — do not wipe logs; note UTC timestamps.
2. **Kill switch** — set `MAINTENANCE_MODE=1` on Vercel if user-facing risk is acute (webhooks + `/api/health` stay up).
3. **Revoke secrets** — follow `docs/secret-rotation.md` for any exposed key (service role, Stripe webhook, Resend, cron, Redis).
4. **Session smash** — force global sign-out for impacted users; admins: revoke + require re-auth / MFA.
5. **Payment freeze** — pause Stripe webhooks only if processing is corrupted (prefer idempotent replay after fix).
6. **Edge defenses** — enable Cloudflare Attack Challenge / tighten WAF; consider BotID if available.
7. **Deploy fix** — patch → preview verify → promote production.
8. **Communication** — SEV-1/2: draft user notice; legal reviews before send.

## Investigation notes

- Prefer sanitized logs (`src/utils/logger.ts`); never paste JWTs / full card data into tickets.
- Correlate `audit_logs.action_type`, Stripe `stripe_webhook_events`, Resend `resend_webhook_events`.
- Capture Sentry event IDs and Vercel deployment URLs in the incident ticket.

## Recovery & close

1. Confirm health endpoint `status: ok` and key user journeys (auth, checkout, apply).
2. Clear `MAINTENANCE_MODE` if set.
3. Postmortem within 5 business days for SEV-1/2 (timeline, root cause, action items, owners).
4. Update this runbook if gaps appeared.

## Related docs

- `docs/secret-rotation.md`
- `docs/security/abuse-reporting-slas.md`
- `docs/security/dpa-and-subprocessors.md`
- `docs/security-hardening-gate-checklist.md`
