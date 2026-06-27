# Schema by Role — Supabase (Layer 1B)

All proposed columns for `YYYYMMDD_pricing_v2_four_tiers.sql`. See plan for full context.

## Shared / billing core

| Table | Fields | Purpose |
|-------|--------|---------|
| `billing_plans` | `slug`, `stripe_product_id`, `stripe_price_id`, `applicants_per_job_limit`, `messaging_enabled`, `resume_download_enabled`, `identity_mode`, `approval_mode`, `priority_listing`, `priority_support`, `early_access`, `display_order`, `is_popular` | Canonical entitlements |
| `employer_subscriptions` | `plan_slug`, `billing_period_start`, `billing_period_end`, `cancel_at_period_end`, `trial_end`, `last_stripe_event_id` | Stripe sync |
| `employer_plan_usage` **(new)** | `employer_id`, `active_jobs_count`, `period_applicants_received`, `period_messages_sent`, `computed_at` | Dashboard meters |
| `entitlement_denials` **(new)** | `employer_id`, `denial_type`, `resource_id`, `plan_slug`, `created_at` | Upgrade UX + admin analytics |
| `stripe_webhook_events` **(new)** | `event_id`, `type`, `payload_hash`, `processed_at` | Idempotent webhooks |
| `application_stage_history` **(new)** | `application_id`, `status`, `actor_id`, `actor_role`, `created_at` | ApplicationTimeline |
| `jobs` | `submitted_for_review_at`, `approved_at`, `approved_by`, `paused_reason`, `priority_score` | Approval + Growth listing |
| `applications` | `is_within_plan_cap`, `masked_preview_snapshot`, `received_at` | Cap + preview |

**Deprecate:** `employer_credits` billing gate, `unlocked_profiles` as gate, `billing_plans.candidate_unlocks`.

## Employer

| Table | Fields |
|-------|--------|
| `company_profiles` | `hiring_regions`, `company_size`, `industry`, `timezone`, `verified_at`, `verification_status` |
| `profiles` | `stripe_customer_id` (single source), `onboarding_completed_at`, `account_status` |
| `jobs` | `application_cap_reached_at`, `visible_applicant_count` |

## Worker

| Table | Fields |
|-------|--------|
| `profiles` | `expected_salary_min/max`, `salary_currency`, `years_experience`, `availability_status`, `profile_visibility`, `resume_storage_path` |
| `worker_skills` | `proficiency_level`, `years_with_skill`, `verified` |
| `chat_threads` | `blocked_reason` (or computed) |

## Admin

| Table | Fields |
|-------|--------|
| `admin_profiles` **(new)** | `user_id`, `admin_role`, `display_name`, `avatar_url`, `department` |
| `disputes` | `employer_id`, `job_id`, `admin_notes` |
| `employer_subscriptions` | `override_plan_id`, `override_expires_at`, `override_reason`, `override_by` |
