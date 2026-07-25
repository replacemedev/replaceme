-- KYC rejection / resubmission_required feedback for worker identity verification.

-- 1) Extend verification_status with resubmission_required
ALTER TYPE public.verification_status ADD VALUE IF NOT EXISTS 'resubmission_required';

-- 2) Store admin feedback shown to the worker on re-submission
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS kyc_rejection_reason TEXT;

COMMENT ON COLUMN public.profiles.kyc_rejection_reason IS
  'Admin feedback when verification_status is rejected or resubmission_required; cleared on re-submit or approval.';

-- 3) Recreate worker_profiles to expose the new column
DROP VIEW IF EXISTS public.worker_profiles;

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
  preferred_language,
  timezone,
  country,
  skills,
  experience_years,
  hourly_rate,
  verification_status,
  is_verified,
  kyc_rejection_reason,
  created_at,
  updated_at
FROM public.profiles
WHERE role = 'worker'::public.user_role;

COMMENT ON VIEW public.worker_profiles IS
  'Worker-facing profile projection including KYC status and rejection feedback.';
