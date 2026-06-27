# Entitlement Matrix — QA Reference

Use this table for manual QA and Playwright assertions. **X** = allowed, **—** = blocked, **(preview)** = anonymous preview only.

**Implementation status:** `Built` = enforced in prod today · `L1B` = schema only · `L3B` = server gates · `L4B` = UI surfaces · `L5B` = seed data · `L6T` = Playwright

## Feature × Tier

| Feature | Discovery | Starter | Growth | Scale | Status |
|---------|-----------|---------|--------|-------|--------|
| Post job (within limit) | X (queued) | X | X | X | L3B (limit); L1B (`job_post_limit`) |
| Exceed active job limit | — | — | — | — | L3B |
| View applicant list | X (max 10) | X (max 20) | X (max 50) | X (∞) | Built (list); L3B (cap) |
| 11th applicant on job | hidden/blocked | — | — | — | L3B; L1B (`is_within_plan_cap`) |
| Full applicant identity | — | X | X | X | Built (unlock flow); **L3B** replaces unlocks |
| Anonymous preview fields | X | — | — | — | **L3B** DTO; L1B (`identity_mode`, `get_applicant_preview`) |
| Download resume | — | X | X | X | L3B |
| Send / receive messages | — | X | X | X | Built (threads); **L3B** tier gate |
| Worker sees blocked thread | X (banner) | — | — | — | **L4B-iv** `MessagingThreadStatus` |
| Priority job badge on board | — | — | X | X | **L4B-ii** public board; L1B (`priority_listing`) |
| Instant job approval | — | X | X | X | Built (non-Discovery); L1B (`approval_mode`) |
| Admin job queue (2-day) | X | — | — | — | Built; L1B (`approval_mode = queued_2d`) |
| Pin workers | soft gate | X | X | X | Built; L3B soft gate on Discovery |
| Post employer review | — | X | X | X | Built; L3B |
| Talent pool search | (preview) | X | X | X | **L4B-iii** `/employer/talent` |
| Stripe subscription | free | paid | paid | paid | **L2B** Checkout + webhooks |
| Plan usage meters on dashboard | — | — | — | — | **L4B-iii** `PlanUsageCard`; L1B (`employer_plan_usage`) |
| Application timeline | — | — | — | — | **L4B-vi** `ApplicationTimeline`; L1B (`application_stage_history`) |
| Interview detail (`scheduled_at`, URL) | — | — | — | — | **L4B-iv** `/worker/interviews/[id]`; L1B (`interviews`) |
| Entitlement denial logging + upgrade CTA | — | — | — | — | **L3B** + **L4B-ii**; L1B (`entitlement_denials`) |
| Admin billing override | — | — | — | — | Built (partial); L1B (`override_*` on subscription) |
| Superadmin vs moderator RBAC | — | — | — | — | **L4B-v**; L1B (`admin_profiles`) |

## Denial types (`entitlement_denials.denial_type`)

| Type | User-facing CTA | Status |
|------|-----------------|--------|
| `job_limit` | Upgrade to post more jobs | L1B table · L3B write · L4B CTA |
| `applicant_limit` | Upgrade for more applicants | L1B · L3B · L4B |
| `messaging` | Upgrade to message candidates | L1B · L3B · L4B-iv banner |
| `resume` | Upgrade for resume downloads | L1B · L3B · L4B |
| `identity` | Upgrade for full profiles | L1B · L3B · L4B |

## Cross-role expectations

| Actor | Discovery employer | Starter employer | Status |
|-------|-------------------|------------------|--------|
| Worker applies | X always | X always | Built · L5B seed |
| Worker messages | blocked banner | X if thread exists | L4B-iv · L6T-X |
| Admin approves job | X required | — | Built · L6T-X |
| Admin sees full PII | X | X | Built |

## Planned-only (not in matrix above)

| Feature | Layer | Notes |
|---------|-------|-------|
| Redis entitlement cache | L9 | Optional post-ship |
| Signed resume URLs | L9 | Storage + short-lived links |
| Rate limits on apply/message | L9 | Edge / middleware |
| Deprecate `employer_credits` / `unlockCandidate` | L3B–4B-i | Remove nav + action gates |
| Grandfather legacy Stripe prices | L2B | See `data-migration.md` |
