# Abuse reporting — ops SLAs

**Audience:** Trust & Safety / Admin ops  
**Last updated:** 2026-07-26  
**Product feature:** Platform reports + Disputes Case Center (`/admin/reports`, `/admin/disputes`)

## Scope

Covers product abuse reports and the unified Case Center. For security breaches, use `incident-runbook.md`.

## Intake channels

| Channel | Queue | Notes |
|---------|-------|--------|
| Platform issue forms | `/admin/reports` · Platform Issues | Rate-limited; evidence optional |
| Job report modal | `/admin/reports` · Job Reports | Worker → job |
| Worker “Report Employer” | `/admin/disputes` | Confidential; `user_reports` |
| Employer “Report Worker” | `/admin/disputes` | Confidential; `user_reports` |
| Messaging auto-flags / “Report conversation” | `/admin/moderation` (+ may create `user_reports`) | Flagged-only queue; audit-logged |
| Email / contact form | Triage → Reports or Disputes | Escalate if illegal content / threats |
| Legacy mediation rows | `/admin/disputes` · Financial / Resolved | Historical `disputes` table |
| Stripe disputes | Admin billing | Parallel path; not this SLA |

## Case Center tabs (`/admin/disputes`)

| Tab | Contents |
|-----|----------|
| Active Mediation (Financial) | `wage_dispute` + open legacy disputes |
| Safety & Policy | Other U2U violations (open/investigating) |
| Resolved / Closed | Resolved/dismissed/closed cases |

Financial outcomes are **advisory only** — the platform does not hold engagement escrow or move wage funds.

## Violation categories (user-to-user)

`scam_fraud`, `payment_circumvention`, `harassment`, `wage_dispute`, `identity_misrepresentation`, `spam_misleading`, `other`

## Confidentiality

Reporter identity is **admin-only**. Do not name the reporter in warning emails, suspension notices, or messages to the reported user (RA 10173 / GDPR). Disclose only under court order or explicit reporter consent.

## SLA targets (business hours, UTC+8 default)

| Priority | Criteria | First response | Resolution target |
|----------|----------|----------------|-------------------|
| **P1** | Imminent harm, CSAM suspicion, credible threat, active fraud ring | 2 hours | 24 hours (or law-enforcement handoff) |
| **P2** | Harassment, scam jobs, clear ToS violations | 1 business day | 3 business days |
| **P3** | Spam, low-quality listings, preference disputes | 2 business days | 7 business days |

“First response” = status/stage moved from open + optional reporter acknowledgment when product supports it.

## Handling procedure

1. **Triage** — assign priority; duplicate-check related reports.
2. **Preserve** — do not delete evidence attachments until resolution + retention window.
3. **Act** — Open case → advisory financial outcome / warn / suspend / dismiss with notes (`logAdminAction` writes audit). Never reveal the reporter.
4. **Document** — admin notes required for dismiss/resolved; include reason codes.
5. **Escalate** — P1 security-adjacent cases → incident lead per runbook.

## Metrics to review monthly

- Median time-to-first-action on P1/P2
- Reopen rate
- False-positive dismissals (user re-report)

## Owners

Assign named owners in your Ops roster (not stored in repo). Engineering ownership: Admin Reports + Disputes Case Center modules.
