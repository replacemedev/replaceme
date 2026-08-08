-- Worker profile overhaul: spoken_languages, job_experiences, chat system_match,
-- drop civil_status / is_remote / earnings_overview. Keep suffix.

-- ═══════════════════════════════════════════════════════════════════════════
-- 1) Profiles: spoken_languages, drop civil_status + is_remote
-- ═══════════════════════════════════════════════════════════════════════════

DROP VIEW IF EXISTS public.worker_profiles;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS spoken_languages TEXT[] DEFAULT '{}'::text[];

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'preferred_language'
  ) THEN
    EXECUTE $u$
      UPDATE public.profiles
      SET spoken_languages = ARRAY[preferred_language]
      WHERE preferred_language IS NOT NULL
        AND preferred_language <> ''
        AND (spoken_languages IS NULL OR cardinality(spoken_languages) = 0)
    $u$;
    EXECUTE 'ALTER TABLE public.profiles DROP COLUMN IF EXISTS preferred_language';
  END IF;
END $$;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS check_employer_no_identity_fields;

ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS civil_status,
  DROP COLUMN IF EXISTS is_remote;

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
      (spoken_languages IS NULL OR cardinality(spoken_languages) = 0)
    )
  );

COMMENT ON CONSTRAINT check_employer_no_identity_fields ON public.profiles IS
  'Employer profiles must not store identity documents, TIN, or personal demographics (birth date, gender, spoken languages).';

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
  gender,
  birth_date,
  spoken_languages,
  id_type,
  id_number,
  id_expiration_date,
  id_issuing_country,
  tin_number,
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
  'Worker-facing profile projection including legal name, demographics, and spoken languages.';

-- ═══════════════════════════════════════════════════════════════════════════
-- 2) job_experiences (evolve worker_projects)
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE IF EXISTS public.worker_projects RENAME TO job_experiences;

ALTER TABLE public.job_experiences
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS role_title TEXT,
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE;

UPDATE public.job_experiences
SET
  company_name = COALESCE(NULLIF(company_name, ''), title, 'Previous role'),
  role_title = COALESCE(NULLIF(role_title, ''), role, 'Contributor'),
  start_date = COALESCE(
    start_date,
    make_date(GREATEST(COALESCE(year, EXTRACT(YEAR FROM now())::int), 1970), 1, 1)
  )
WHERE company_name IS NULL OR role_title IS NULL OR start_date IS NULL;

ALTER TABLE public.job_experiences
  ALTER COLUMN company_name SET NOT NULL,
  ALTER COLUMN role_title SET NOT NULL,
  ALTER COLUMN start_date SET NOT NULL;

ALTER TABLE public.job_experiences
  DROP COLUMN IF EXISTS title,
  DROP COLUMN IF EXISTS role,
  DROP COLUMN IF EXISTS year;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'worker_projects_worker_id_fkey'
  ) THEN
    ALTER TABLE public.job_experiences
      RENAME CONSTRAINT worker_projects_worker_id_fkey TO job_experiences_worker_id_fkey;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DROP POLICY IF EXISTS "Worker projects are viewable by everyone" ON public.job_experiences;
DROP POLICY IF EXISTS "Workers can manage their own projects" ON public.job_experiences;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Job experiences are viewable by everyone'
      AND tablename = 'job_experiences'
  ) THEN
    CREATE POLICY "Job experiences are viewable by everyone"
      ON public.job_experiences FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Workers can manage their own job experiences'
      AND tablename = 'job_experiences'
  ) THEN
    CREATE POLICY "Workers can manage their own job experiences"
      ON public.job_experiences FOR ALL
      USING (auth.uid() = worker_id)
      WITH CHECK (auth.uid() = worker_id);
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3) Drop earnings_overview
-- ═══════════════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS public.earnings_overview CASCADE;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4) Chat: system_match messages + payload + nullable sender
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS message_kind TEXT NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS payload JSONB;

ALTER TABLE public.chat_messages
  DROP CONSTRAINT IF EXISTS chat_messages_message_kind_check;

ALTER TABLE public.chat_messages
  ADD CONSTRAINT chat_messages_message_kind_check
  CHECK (message_kind IN ('user', 'system_match'));

ALTER TABLE public.chat_messages
  ALTER COLUMN sender_id DROP NOT NULL;

CREATE TABLE IF NOT EXISTS public.skill_match_outreach (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES public.chat_threads(id) ON DELETE SET NULL,
  match_score INTEGER,
  overlapping_skills TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (job_id, worker_id)
);

CREATE INDEX IF NOT EXISTS idx_skill_match_outreach_worker
  ON public.skill_match_outreach (worker_id);

CREATE INDEX IF NOT EXISTS idx_skill_match_outreach_job
  ON public.skill_match_outreach (job_id);

ALTER TABLE public.skill_match_outreach ENABLE ROW LEVEL SECURITY;

-- Service role / admin client only for writes; workers/employers can read their rows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Workers can view own skill match outreach'
      AND tablename = 'skill_match_outreach'
  ) THEN
    CREATE POLICY "Workers can view own skill match outreach"
      ON public.skill_match_outreach FOR SELECT
      USING (auth.uid() = worker_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Employers can view skill match outreach for their jobs'
      AND tablename = 'skill_match_outreach'
  ) THEN
    CREATE POLICY "Employers can view skill match outreach for their jobs"
      ON public.skill_match_outreach FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.jobs j
          WHERE j.id = skill_match_outreach.job_id
            AND j.employer_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5) Update get_applicant_preview for job_experiences + spoken_languages
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_applicant_preview(
  p_application_id UUID,
  p_employer_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_app RECORD;
  v_worker RECORD;
  v_full BOOLEAN;
  v_skills JSONB;
  v_experiences JSONB;
BEGIN
  SELECT a.id, a.job_id, a.candidate_id, a.status, a.match_score, a.masked_preview_snapshot
  INTO v_app
  FROM public.applications a
  JOIN public.jobs j ON j.id = a.job_id
  WHERE a.id = p_application_id
    AND j.employer_id = p_employer_id;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  v_full := public.employer_has_full_identity(p_employer_id);

  SELECT
    p.id,
    p.first_name,
    p.middle_name,
    p.last_name,
    p.suffix,
    p.full_name,
    p.email,
    p.avatar_url,
    p.professional_title,
    p.bio,
    p.location,
    p.portfolio_url,
    p.experience_years,
    p.skills,
    p.spoken_languages,
    p.resume_url,
    p.cv_url,
    p.is_verified,
    p.expected_salary_min,
    p.expected_salary_max,
    p.salary_currency,
    p.hourly_rate,
    p.availability
  INTO v_worker
  FROM public.profiles p
  WHERE p.id = v_app.candidate_id;

  IF v_full THEN
    SELECT COALESCE(jsonb_agg(skill_row), '[]'::jsonb)
    INTO v_skills
    FROM (
      SELECT jsonb_build_object(
        'id', ws.id,
        'skill_name', ws.skill_name,
        'proficiency', ws.proficiency,
        'proficiency_label', ws.proficiency_label,
        'category', ws.category,
        'experience_duration', ws.experience_duration
      ) AS skill_row
      FROM public.worker_skills ws
      WHERE ws.worker_id = v_app.candidate_id
        AND (ws.category = 'top' OR ws.category IS NULL)
      ORDER BY ws.proficiency DESC
      LIMIT 12
    ) ranked_skills;

    SELECT COALESCE(jsonb_agg(exp_row), '[]'::jsonb)
    INTO v_experiences
    FROM (
      SELECT jsonb_build_object(
        'id', je.id,
        'company_name', je.company_name,
        'role_title', je.role_title,
        'start_date', je.start_date,
        'end_date', je.end_date,
        'description', je.description,
        'skills_used', je.skills_used
      ) AS exp_row
      FROM public.job_experiences je
      WHERE je.worker_id = v_app.candidate_id
      ORDER BY je.start_date DESC NULLS LAST
      LIMIT 8
    ) ranked_experiences;

    RETURN jsonb_build_object(
      'application_id', v_app.id,
      'job_id', v_app.job_id,
      'status', v_app.status,
      'match_score', v_app.match_score,
      'identity_mode', 'full',
      'candidate', COALESCE(to_jsonb(v_worker), '{}'::jsonb) || jsonb_build_object(
        'worker_skills', v_skills,
        'job_experiences', v_experiences
      )
    );
  END IF;

  RETURN jsonb_build_object(
    'application_id', v_app.id,
    'job_id', v_app.job_id,
    'status', v_app.status,
    'match_score', v_app.match_score,
    'identity_mode', 'anonymous_preview',
    'candidate', jsonb_build_object(
      'id', v_worker.id,
      'skills', v_worker.skills,
      'spoken_languages', v_worker.spoken_languages,
      'experience_years', v_worker.experience_years,
      'expected_salary_min', v_worker.expected_salary_min,
      'expected_salary_max', v_worker.expected_salary_max,
      'salary_currency', v_worker.salary_currency,
      'professional_title', v_worker.professional_title
    ),
    'snapshot', v_app.masked_preview_snapshot
  );
END;
$$;

COMMENT ON FUNCTION public.get_applicant_preview(UUID, UUID) IS
  'Employer applicant preview with job_experiences and spoken_languages.';

GRANT EXECUTE ON FUNCTION public.get_applicant_preview(UUID, UUID) TO authenticated;
