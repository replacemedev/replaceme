# Abuse reporting — ops SLAs

**Audience:** Trust & Safety / Admin ops  
**Last updated:** 2026-07-26  
**Product feature:** User reports + admin queue (`src/actions/reports.ts`, `/admin/reports`)

## Scope

Covers product abuse reports (platform issues, job reports, user-to-user reports), not general support tickets. For security breaches, use `incident-runbook.md`.

## Intake channels

| Channel | Queue tab | Notes |
|---------|-----------|--------|
| Platform issue forms | Platform Issues | Rate-limited; evidence optional |
| Job report modal | Job Reports | Worker → job |
| Worker “Report Employer” | Employer Reports | Confidential; `user_reports` |
| Employer “Report Worker” | Worker Reports | Confidential; `user_reports` |
| Email / contact form | Triage → Reports or legal | Escalate if illegal content / threats |
| Legacy disputes | `/admin/disputes` | Historical wage/mediation rows |
| Stripe disputes | Admin billing | Parallel path; not this SLA |

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

“First response” = status moved from open + optional reporter acknowledgment when product supports it.

## Handling procedure

1. **Triage** — assign priority; duplicate-check related reports.
2. **Preserve** — do not delete evidence attachments until resolution + retention window.
3. **Act** — Review case → Send warning / Suspend reported user / Dismiss with notes (`logAdminAction` writes audit). Never reveal the reporter.
4. **Document** — admin notes required for dismiss/resolved; include reason codes.
5. **Escalate** — P1 security-adjacent cases → incident lead per runbook.

## Metrics to review monthly

- Median time-to-first-action on P1/P2
- Reopen rate
- False-positive dismissals (user re-report)

## Owners

Assign named owners in your Ops roster (not stored in repo). Engineering ownership of the queue UI: Admin Reports module.
