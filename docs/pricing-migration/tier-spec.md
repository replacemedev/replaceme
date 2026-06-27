# Canonical Tier Spec (Entitlements-Only)

**Effective:** Pricing migration v2  
**Deprecates:** credit-based unlocks (`employer_credits`, `unlockCandidate`, `purchaseCreditPack`)

## Tiers

| Slug | Display name | Price (USD/mo) | Active jobs | Applicants/job | Job approval | Identity | Resume | Messaging | Extras |
|------|--------------|----------------|-------------|----------------|--------------|----------|--------|-----------|--------|
| `discovery` | Discovery | $0 | 1 | 10 | 2-day admin queue | Anonymous preview | No | No | — |
| `starter` | Starter | $19 | 3 | 20 | Instant | Full | Yes | Yes | Email support |
| `growth` | Growth | $39 | 10 | 50 | Instant | Full | Yes | Yes | Priority listing |
| `scale` | Scale | $79 | Unlimited (`NULL`) | Unlimited (`NULL`) | Instant | Full | Yes | Yes | Priority support, early access |

**Growth** is `is_popular = true` in `billing_plans`.

## Anonymous preview (Discovery only)

Employers on Discovery see applicant **preview DTO** only:

- Skills (from `worker_skills`)
- Years of experience
- Expected salary range
- Application status / match score

**Excluded:** legal name, email, avatar, resume URL, phone, full profile link.

## Entitlement keys (server + RLS)

| Key | Type | Discovery | Starter | Growth | Scale |
|-----|------|-----------|---------|--------|-------|
| `active_jobs_limit` | int \| null | 1 | 3 | 10 | null |
| `applicants_per_job_limit` | int \| null | 10 | 20 | 50 | null |
| `messaging_enabled` | bool | false | true | true | true |
| `resume_download_enabled` | bool | false | true | true | true |
| `identity_mode` | enum | `anonymous_preview` | `full` | `full` | `full` |
| `approval_mode` | enum | `queued_2d` | `instant` | `instant` | `instant` |
| `priority_listing` | bool | false | false | true | true |
| `priority_support` | bool | false | false | false | true |
| `early_access` | bool | false | false | false | true |

## Dashboard usage copy

| Meter | Example label |
|-------|---------------|
| Active jobs | `1/3 Active Jobs Used` or `1/1` (Discovery) or `∞` (Scale) |
| Applicants | `8/20 Applicants` (per highest-fill job or aggregate — document in UI) |
| Messaging | `Enabled` or `Upgrade to message` |

Color: green &lt;80%, amber 80–99%, red at 100%.

## Suggested upgrade path

| Trigger | Suggested slug |
|---------|----------------|
| Job limit hit | `starter` → `growth` → `scale` |
| Applicant cap | same |
| Messaging blocked | `starter` minimum |
| Resume / full identity | `starter` minimum |
