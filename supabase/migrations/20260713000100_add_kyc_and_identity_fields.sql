-- Add KYC, identity, and statutory columns to public.profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS suffix TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS civil_status TEXT,
  ADD COLUMN IF NOT EXISTS id_type TEXT,
  ADD COLUMN IF NOT EXISTS id_number TEXT,
  ADD COLUMN IF NOT EXISTS id_expiration_date DATE,
  ADD COLUMN IF NOT EXISTS id_issuing_country TEXT,
  ADD COLUMN IF NOT EXISTS tin_number TEXT,
  ADD COLUMN IF NOT EXISTS sss_number TEXT,
  ADD COLUMN IF NOT EXISTS philhealth_number TEXT,
  ADD COLUMN IF NOT EXISTS pagibig_number TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS preferred_language TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS personal_address TEXT,
  ADD COLUMN IF NOT EXISTS personal_city TEXT,
  ADD COLUMN IF NOT EXISTS personal_state_province TEXT;

-- Drop dependent worker_profiles view first to alter profiles full_name generated column
DROP VIEW IF EXISTS public.worker_profiles;

-- Alter full_name generated column to append suffix
ALTER TABLE public.profiles DROP COLUMN IF EXISTS full_name;
ALTER TABLE public.profiles ADD COLUMN full_name TEXT GENERATED ALWAYS AS (
  COALESCE(first_name, '') || 
  CASE WHEN middle_name IS NOT NULL AND middle_name <> '' THEN ' ' || middle_name ELSE '' END || 
  CASE WHEN last_name IS NOT NULL AND last_name <> '' THEN ' ' || last_name ELSE '' END ||
  CASE WHEN suffix IS NOT NULL AND suffix <> '' THEN ' ' || suffix ELSE '' END
) STORED;

-- Recreate worker_profiles view with new fields
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
  phone_number,
  gender,
  civil_status,
  birth_date,
  id_type,
  id_number,
  id_expiration_date,
  id_issuing_country,
  tin_number,
  sss_number,
  philhealth_number,
  pagibig_number,
  emergency_contact_name,
  emergency_contact_relationship,
  emergency_contact_phone,
  preferred_language,
  timezone,
  country,
  personal_address,
  personal_city,
  personal_state_province,
  skills,
  experience_years,
  hourly_rate,
  verification_status,
  is_verified,
  created_at,
  updated_at
FROM public.profiles
WHERE role = 'worker'::public.user_role;

COMMENT ON VIEW public.worker_profiles IS 'Worker-facing profile projection including new identity and statutory details';

-- Recreate handle_new_user trigger to save suffix and phone_number from auth metadata
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
    suffix,
    phone_number,
    role
  ) VALUES (
    new.id,
    new.email,
    final_username,
    COALESCE(new.raw_user_meta_data->>'first_name', 'Unknown'),
    new.raw_user_meta_data->>'middle_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'suffix',
    new.raw_user_meta_data->>'phone_number',
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
