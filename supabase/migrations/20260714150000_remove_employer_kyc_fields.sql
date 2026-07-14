-- Migration to clean up existing employer profiles and add a check constraint enforcing that identity details are NULL for employers.
-- Do not drop or delete columns, as Workers rely on them.

-- 1) Clean up existing employer profiles to remove identity data if any was saved during previous onboarding versions.
UPDATE public.profiles
SET 
  id_type = NULL,
  id_number = NULL,
  id_expiration_date = NULL,
  id_issuing_country = NULL
WHERE role = 'employer'::public.user_role;

-- 2) Add a check constraint to enforce that employers must not have identity details.
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS check_employer_no_identity_fields;

ALTER TABLE public.profiles
  ADD CONSTRAINT check_employer_no_identity_fields
  CHECK (
    role <> 'employer'::public.user_role OR 
    (id_type IS NULL AND id_number IS NULL AND id_expiration_date IS NULL AND id_issuing_country IS NULL)
  );

COMMENT ON CONSTRAINT check_employer_no_identity_fields ON public.profiles IS
  'Ensures that identity document details are NULL for employer profiles, as they are only applicable to workers.';
