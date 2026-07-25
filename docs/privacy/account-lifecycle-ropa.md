# Account lifecycle — ROPA note (internal)

**Audience:** Privacy / Legal / Ops  
**Last updated:** 2026-07-26  
**Related:** `src/lib/data/legal.ts` (`ACCOUNT_LIFECYCLE_TIMELINES`, `DATA_RETENTION_PERIODS`), Privacy Policy §9, Terms §5.3 / §7 / §11

Short record of processing activities (ROPA-style) for Phase 1 account lifecycle: suspend, soft-delete / anonymize, and legal retention.

## Purposes → retention → soft-delete

| Purpose | Categories | Retention while active | Soft-delete / anonymize | Notes |
|---------|------------|------------------------|-------------------------|-------|
| Account administration & marketplace matching | Profile, contact, auth identifiers | While account is active | After closure: **30-day** grace (`deletionGraceCalendarDays`), then anonymize / erase Platform PIC copy | Suspension does **not** trigger erasure |
| Identity / KYC (RA 11967 listing) | Government ID images, verification metadata | Until verification purpose fulfilled | Delete or anonymize within **90 days** after purpose unless legal hold | Heightened SPI safeguards |
| Applications & messaging | Application materials, in-product messages | While relevant to open roles / activity | Up to **24 months** after relevance ends; closed with account subject to grace | Employer-held unlocked copies are Employer PIC |
| Billing & tax (subscriptions) | Stripe metadata, invoices, ledger | While subscribed + dispute window | Retain up to **7 years** where tax/accounting law requires | Not erased solely by account closure |
| Security / fraud / audit | Security logs, abuse signals | Continuous for ops | Up to **24 months** | May outlive account for incident defense |
| Job post moderation (Trust & Safety) | Rejection/approve metadata, reason category, optional explanation, admin actor | While job exists + post-decision audit | Up to **24 months** after decision unless legal hold | Employer notified on reject; Discovery queued (`queued_2d`), paid instant; daily admin SLA reminder cron (no auto-publish) |
| Cookie consent records | Consent choice + policy version | Until withdraw or policy bump | Aligned with Cookie Policy version | Account deletion does not clear browser cookies |

## Operational clocks (source of truth)

| Clock | Value | Constant |
|-------|-------|----------|
| Default suspend duration | 30 days | `suspendDefaultDays` |
| Suspend options | 7 / 14 / 30 / 90 / indefinite | `suspendOptionsDays`, `suspendIndefiniteAllowed` |
| Deletion acknowledgement | 5 business days | `deletionAckBusinessDays` / `DELETION_REQUEST_SLA` |
| Deletion grace (recovery) | 30 calendar days | `deletionGraceCalendarDays` |
| Eligible erasure complete | within 30 calendar days (subject to exceptions) | `eligibleErasureCalendarDays` |
| Appeal acknowledgement | 2 business days | `appealAckBusinessDays` / `APPEAL_SLA_COPY` |

## Soft-delete behavior

1. **Suspend** — login/features restricted; row remains identifiable; no anonymization.
2. **Close / soft-delete** — schedule grace end; user notified; blockers (active jobs, billing) resolved first where required.
3. **Post-grace anonymize** — replace or null personal fields on Platform-held records; keep non-identifying aggregates and legally required billing rows.
4. **Backup restore** — re-apply erasure so closed accounts do not reappear with PII.

## Controllers

- **Replaceme** — PIC for Platform-held account, verification, billing orchestration, and security logs.
- **Employer** — independent PIC for Worker data after unlock / export (see Employer DPA §7).

Public disclosures: Privacy Policy §9 / §11, Terms §11, `/subprocessors`, Help Center Trust & Safety articles.
