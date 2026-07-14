-- Harden identity uniqueness for worker + employer signup.
-- Username: unique on profiles AND company_profiles (already present as *_username_key).
-- Email: case-insensitive unique across all profiles (workers and employers share public.profiles).

-- 1) Ensure username UNIQUE on profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_username_key'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_username_key UNIQUE (username);
  END IF;
END $$;

-- 2) Ensure username UNIQUE on company_profiles (employer display/login usernames)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'company_profiles_username_key'
      AND conrelid = 'public.company_profiles'::regclass
  ) THEN
    ALTER TABLE public.company_profiles
      ADD CONSTRAINT company_profiles_username_key UNIQUE (username);
  END IF;
END $$;

-- 3) Named alias constraint requested by product (unique_username).
-- Skip if profiles_username_key already covers the column (one UNIQUE per column set).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_username'
      AND conrelid = 'public.profiles'::regclass
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_username_key'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT unique_username UNIQUE (username);
  END IF;
END $$;

-- 4) Case-insensitive unique email (workers and employers share this table)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique_lower_idx
  ON public.profiles (lower(email))
  WHERE email IS NOT NULL;

-- 5) Named unique_email constraint when safe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname IN ('unique_email', 'profiles_email_key')
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    BEGIN
      ALTER TABLE public.profiles
        ADD CONSTRAINT unique_email UNIQUE (email);
    EXCEPTION
      WHEN duplicate_table OR unique_violation OR duplicate_object THEN
        RAISE NOTICE 'unique_email constraint skipped (already covered or conflict)';
    END;
  END IF;
END $$;

COMMENT ON INDEX public.profiles_email_unique_lower_idx IS
  'Case-insensitive uniqueness for profiles.email across worker and employer accounts';
COMMENT ON CONSTRAINT profiles_username_key ON public.profiles IS
  'Globally unique profile username (shared namespace with company_profiles via signup checks)';
