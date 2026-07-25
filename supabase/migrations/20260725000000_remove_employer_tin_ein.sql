-- Clear employer TIN/EIN data and forbid future storage on employer profiles.
-- Keep profiles.tin_number for workers (shared column).

UPDATE public.profiles
SET tin_number = NULL
WHERE role = 'employer'::public.user_role;

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
      tin_number IS NULL
    )
  );

COMMENT ON CONSTRAINT check_employer_no_identity_fields ON public.profiles IS
  'Ensures that identity document details and TIN/EIN are NULL for employer profiles; those fields apply to workers only.';
