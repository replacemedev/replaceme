-- Migration: Add birth_date DATE to public.profiles, migrate existing birth_year values, and drop birth_year column/constraint.

-- 1. Add birth_date column of type DATE to public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date DATE;

-- 2. Migrate existing data from birth_year (representing year) to birth_date (defaulting to Jan 1st of that year)
UPDATE public.profiles 
SET birth_date = (birth_year || '-01-01')::DATE 
WHERE birth_year IS NOT NULL;

-- 3. Drop the old constraint profiles_birth_year_range
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_birth_year_range;

-- 4. Add constraint for birth_date to ensure it's not in the future and is after 1900
ALTER TABLE public.profiles ADD CONSTRAINT profiles_birth_date_range CHECK (
  birth_date IS NULL OR (birth_date >= '1900-01-01' AND birth_date <= CURRENT_DATE)
);

-- 5. Drop the old birth_year column
ALTER TABLE public.profiles DROP COLUMN IF EXISTS birth_year;
