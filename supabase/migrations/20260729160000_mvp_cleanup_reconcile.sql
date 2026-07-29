-- MVP cleanup: drop deprecated fields while preserving worker KYC legal names.
-- Safe to re-run (IF EXISTS / IF NOT EXISTS).

-- ── Employer application notification enum + column ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employer_notification_preference') THEN
    CREATE TYPE public.employer_notification_preference AS ENUM (
      'email_every_applicant',
      'email_daily_summary',
      'dashboard_only'
    );
  END IF;
END $$;

ALTER TABLE public.company_profiles
  ADD COLUMN IF NOT EXISTS application_notification_pref
    public.employer_notification_preference
    NOT NULL
    DEFAULT 'email_every_applicant';

ALTER TABLE public.company_profiles
  ADD COLUMN IF NOT EXISTS industry_custom TEXT;

COMMENT ON COLUMN public.company_profiles.application_notification_pref IS
  'How the employer wants applicant email notifications. No SMS.';

COMMENT ON COLUMN public.company_profiles.industry_custom IS
  'Free-text industry when employer selects Other during onboarding.';

-- ── Drop deprecated profile / company columns (keep middle_name, suffix, country) ──
ALTER TABLE public.profiles DROP COLUMN IF EXISTS username;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS phone_number;
ALTER TABLE public.company_profiles DROP COLUMN IF EXISTS username;
ALTER TABLE public.company_profiles DROP COLUMN IF EXISTS phone_number;
ALTER TABLE public.company_profiles DROP COLUMN IF EXISTS country;

-- ── Drop hiring team placeholders on jobs ──
ALTER TABLE public.jobs DROP COLUMN IF EXISTS hiring_manager_name;
ALTER TABLE public.jobs DROP COLUMN IF EXISTS hiring_manager_role;
ALTER TABLE public.jobs DROP COLUMN IF EXISTS hiring_manager_email;
