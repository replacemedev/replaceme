-- Migration: Add middle_name TEXT to public.profiles, alter full_name generated column, recreate worker_profiles view, and update handle_new_user trigger.

-- 1. Add middle_name column if it does not exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS middle_name TEXT;

-- 2. Drop the existing full_name generated column to modify its generation expression
ALTER TABLE public.profiles DROP COLUMN IF EXISTS full_name;

-- 3. Re-add full_name as a generated column incorporating middle_name
ALTER TABLE public.profiles ADD COLUMN full_name TEXT GENERATED ALWAYS AS (
  COALESCE(first_name, '') || 
  CASE WHEN middle_name IS NOT NULL AND middle_name <> '' THEN ' ' || middle_name ELSE '' END || 
  CASE WHEN last_name IS NOT NULL AND last_name <> '' THEN ' ' || last_name ELSE '' END
) STORED;

-- 4. Recreate the worker_profiles view incorporating middle_name
CREATE OR REPLACE VIEW public.worker_profiles AS
SELECT
  id AS worker_id,
  id AS profile_id,
  first_name,
  middle_name,
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

-- 5. Update the handle_new_user trigger function to map middle_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_val public.user_role;
  input_username TEXT;
  final_username TEXT;
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

  input_username := COALESCE(
    new.raw_user_meta_data->>'username',
    'user_' || substr(new.id::text, 1, 8)
  );
  final_username := input_username;

  IF EXISTS (
    SELECT 1 FROM public.profiles WHERE username = final_username
  ) OR EXISTS (
    SELECT 1 FROM public.company_profiles WHERE username = final_username
  ) THEN
    RAISE EXCEPTION 'Username "%" is already taken.', final_username USING ERRCODE = '23505';
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    username,
    first_name,
    middle_name,
    last_name,
    role
  ) VALUES (
    new.id,
    new.email,
    final_username,
    COALESCE(new.raw_user_meta_data->>'first_name', 'Unknown'),
    new.raw_user_meta_data->>'middle_name',
    new.raw_user_meta_data->>'last_name',
    user_role_val
  ) ON CONFLICT (id) DO NOTHING;

  IF user_role_val = 'employer'::public.user_role THEN
    INSERT INTO public.company_profiles (employer_id, company_name, username, role)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'company_name', 'Unknown Company'),
      final_username,
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
