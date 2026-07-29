-- Restore worker legal-name fields needed for KYC matching.
-- Keep username, phone_number, and interview removal intact.

DROP VIEW IF EXISTS public.worker_profiles;

ALTER TABLE public.profiles DROP COLUMN IF EXISTS full_name;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS middle_name TEXT,
  ADD COLUMN IF NOT EXISTS suffix TEXT;

ALTER TABLE public.profiles
  ADD COLUMN full_name TEXT GENERATED ALWAYS AS (
    COALESCE(first_name, '') ||
    CASE WHEN middle_name IS NOT NULL AND middle_name <> '' THEN ' ' || middle_name ELSE '' END ||
    CASE WHEN last_name IS NOT NULL AND last_name <> '' THEN ' ' || last_name ELSE '' END ||
    CASE WHEN suffix IS NOT NULL AND suffix <> '' THEN ' ' || suffix ELSE '' END
  ) STORED;

CREATE OR REPLACE VIEW public.worker_profiles
WITH (security_invoker = true) AS
SELECT
  id AS worker_id,
  id AS profile_id,
  first_name,
  middle_name,
  last_name,
  suffix,
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
  'Worker-facing profile projection including legal-name fields for KYC.';

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
    middle_name,
    last_name,
    suffix,
    role
  ) VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', 'Unknown'),
    new.raw_user_meta_data->>'middle_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'suffix',
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
