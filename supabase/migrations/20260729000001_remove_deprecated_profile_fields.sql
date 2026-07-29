-- Migration: Remove deprecated profile fields
-- Removes: username, middle_name, suffix, phone_number from profiles
-- Removes: phone_number, country, username from company_profiles
-- Adds: industry_custom to company_profiles for "Other" industry input
-- Updates: worker_profiles view and handle_new_user trigger

-- ─────────────────────────────────────────
-- 1. Drop worker_profiles view (depends on columns we're dropping)
-- ─────────────────────────────────────────
DROP VIEW IF EXISTS public.worker_profiles;

-- ─────────────────────────────────────────
-- 2. Drop full_name generated column (depends on middle_name)
-- ─────────────────────────────────────────
ALTER TABLE public.profiles DROP COLUMN IF EXISTS full_name;

-- ─────────────────────────────────────────
-- 3. Remove deprecated columns from profiles
-- ─────────────────────────────────────────
ALTER TABLE public.profiles DROP COLUMN IF EXISTS middle_name;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS suffix;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS phone_number;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS username;

-- ─────────────────────────────────────────
-- 4. Re-add full_name as generated column (first + last only)
-- ─────────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN full_name TEXT GENERATED ALWAYS AS (
  COALESCE(first_name, '') ||
  CASE WHEN last_name IS NOT NULL AND last_name <> '' THEN ' ' || last_name ELSE '' END
) STORED;

-- ─────────────────────────────────────────
-- 5. Remove deprecated columns from company_profiles
-- ─────────────────────────────────────────
ALTER TABLE public.company_profiles DROP COLUMN IF EXISTS phone_number;
ALTER TABLE public.company_profiles DROP COLUMN IF EXISTS country;
ALTER TABLE public.company_profiles DROP COLUMN IF EXISTS username;

-- ─────────────────────────────────────────
-- 6. Add industry_custom to company_profiles
-- ─────────────────────────────────────────
ALTER TABLE public.company_profiles
  ADD COLUMN IF NOT EXISTS industry_custom TEXT;

COMMENT ON COLUMN public.company_profiles.industry_custom IS
  'Free-text industry name when employer selects "Other" during onboarding.';

-- ─────────────────────────────────────────
-- 7. Recreate worker_profiles view without dropped columns
-- ─────────────────────────────────────────
CREATE OR REPLACE VIEW public.worker_profiles
WITH (security_invoker = true) AS
SELECT
  id AS worker_id,
  id AS profile_id,
  first_name,
  last_name,
  full_name,
  professional_title,
  avatar_url,
  email,
  skills,
  experience_years,
  hourly_rate,
  verification_status,
  is_verified,
  created_at,
  updated_at
FROM public.profiles
WHERE role = 'worker'::public.user_role;

COMMENT ON VIEW public.worker_profiles IS
  'Worker-facing profile projection. PII fields removed (no phone, middle name, suffix, username).';

-- ─────────────────────────────────────────
-- 8. Update handle_new_user trigger — remove username, middle_name, suffix, phone_number
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_val public.user_role;
  discovery_plan_id UUID;
BEGIN
  PERFORM set_config('app.provisioning_signup', 'true', true);

  SELECT id INTO discovery_plan_id
  FROM public.billing_plans
  WHERE slug = 'discovery'
  LIMIT 1;

  BEGIN
    user_role_val := COALESCE(
      (new.raw_user_meta_data->>'role')::public.user_role,
      'worker'::public.user_role
    );
  EXCEPTION WHEN OTHERS THEN
    user_role_val := 'worker'::public.user_role;
  END;

  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    role
  ) VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', 'Unknown'),
    new.raw_user_meta_data->>'last_name',
    user_role_val
  ) ON CONFLICT (id) DO NOTHING;

  IF user_role_val = 'employer'::public.user_role THEN
    INSERT INTO public.company_profiles (employer_id, company_name, role)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'company_name', 'Unknown Company'),
      user_role_val
    )
    ON CONFLICT (employer_id) DO NOTHING;

    INSERT INTO public.employer_credits (employer_id, credits_balance)
    VALUES (new.id, 5)
    ON CONFLICT (employer_id) DO NOTHING;

    INSERT INTO public.employer_subscriptions (employer_id, plan_id, plan_slug, status)
    VALUES (new.id, discovery_plan_id, 'discovery', 'active')
    ON CONFLICT (employer_id) DO NOTHING;

    INSERT INTO public.employer_plan_usage (employer_id)
    VALUES (new.id)
    ON CONFLICT (employer_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$;
