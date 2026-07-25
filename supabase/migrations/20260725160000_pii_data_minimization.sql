-- Phase C: data minimization — drop unused SPI / employer personal address columns.
-- Shared demographics (birth_date, gender, civil_status) remain for workers;
-- employers are forced NULL via CHECK (extends existing identity constraint).

-- 1) Clear employer demographics that must remain on shared columns
UPDATE public.profiles
SET
  birth_date = NULL,
  gender = NULL,
  civil_status = NULL,
  personal_address = NULL,
  personal_city = NULL,
  personal_state_province = NULL
WHERE role = 'employer'::public.user_role;

-- 2) Clear worker statutory / emergency fields before drop
UPDATE public.profiles
SET
  sss_number = NULL,
  philhealth_number = NULL,
  pagibig_number = NULL,
  emergency_contact_name = NULL,
  emergency_contact_relationship = NULL,
  emergency_contact_phone = NULL;

-- 3) Drop dependent view before column drops
DROP VIEW IF EXISTS public.worker_profiles;

-- 4) Drop minimized columns
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS sss_number,
  DROP COLUMN IF EXISTS philhealth_number,
  DROP COLUMN IF EXISTS pagibig_number,
  DROP COLUMN IF EXISTS emergency_contact_name,
  DROP COLUMN IF EXISTS emergency_contact_relationship,
  DROP COLUMN IF EXISTS emergency_contact_phone,
  DROP COLUMN IF EXISTS personal_address,
  DROP COLUMN IF EXISTS personal_city,
  DROP COLUMN IF EXISTS personal_state_province;

-- 5) Employers may not store worker-style demographics
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS check_employer_no_identity_fields;

ALTER TABLE public.profiles
  ADD CONSTRAINT check_employer_no_identity_fields
  CHECK (
    role <> 'employer'::public.user_role OR
    (
      id_type IS NULL AND
      id_number IS NULL AND
      id_expiration_date IS NULL AND
      id_issuing_country IS NULL AND
      tin_number IS NULL AND
      birth_date IS NULL AND
      gender IS NULL AND
      civil_status IS NULL
    )
  );

COMMENT ON CONSTRAINT check_employer_no_identity_fields ON public.profiles IS
  'Employer profiles must not store identity documents, TIN, or personal demographics (birth date, gender, civil status).';

-- 6) Recreate worker_profiles without dropped columns
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
  created_at,
  updated_at
FROM public.profiles
WHERE role = 'worker'::public.user_role;

COMMENT ON VIEW public.worker_profiles IS
  'Worker-facing profile projection (data-minimized: no SSS/PhilHealth/Pag-IBIG/emergency/personal address).';

-- 7) Deletion / privacy request audit log (in-app deletion UX)
CREATE TABLE IF NOT EXISTS public.data_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('worker', 'employer')),
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS data_deletion_requests_user_id_idx
  ON public.data_deletion_requests (user_id);

CREATE INDEX IF NOT EXISTS data_deletion_requests_status_idx
  ON public.data_deletion_requests (status);

ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own deletion requests"
  ON public.data_deletion_requests;
CREATE POLICY "Users can insert own deletion requests"
  ON public.data_deletion_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own deletion requests"
  ON public.data_deletion_requests;
CREATE POLICY "Users can read own deletion requests"
  ON public.data_deletion_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage deletion requests"
  ON public.data_deletion_requests;
CREATE POLICY "Admins can manage deletion requests"
  ON public.data_deletion_requests
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

COMMENT ON TABLE public.data_deletion_requests IS
  'User-submitted personal data deletion / erasure requests (RA 10173 / GDPR Art. 17).';
