-- Migration: Add employer-specific application notification preference
-- Replaces free-form boolean flags with a single enum for application notifications
-- No SMS options whatsoever.

-- Create enum for employer application notification preference
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employer_notification_preference') THEN
    CREATE TYPE public.employer_notification_preference AS ENUM (
      'email_every_applicant',
      'email_daily_summary',
      'dashboard_only'
    );
  END IF;
END $$;

-- Add column to company_profiles for employer notification preference
ALTER TABLE public.company_profiles
  ADD COLUMN IF NOT EXISTS application_notification_pref
    public.employer_notification_preference
    NOT NULL
    DEFAULT 'email_every_applicant';

COMMENT ON COLUMN public.company_profiles.application_notification_pref IS
  'How the employer wants to be notified of new applicants. No SMS.';
