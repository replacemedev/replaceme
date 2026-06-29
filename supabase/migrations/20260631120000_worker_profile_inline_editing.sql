-- Inline worker profile editing: project skills, skill ordering, birth year integrity.

ALTER TABLE public.worker_projects
  ADD COLUMN IF NOT EXISTS skills_used TEXT[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now());

ALTER TABLE public.worker_skills
  ADD COLUMN IF NOT EXISTS display_order SMALLINT NOT NULL DEFAULT 0;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_birth_year_range;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_birth_year_range
  CHECK (
    birth_year IS NULL
    OR birth_year BETWEEN 1940 AND EXTRACT(YEAR FROM now())::int
  );
