-- Worker portal completeness: WITHDRAWN status, PHP default currency, enriched applicant preview.

ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'WITHDRAWN';

ALTER TABLE public.profiles
  ALTER COLUMN salary_currency SET DEFAULT 'PHP';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_salary_currency_allowed;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_salary_currency_allowed
  CHECK (salary_currency IN ('PHP', 'USD', 'EUR', 'GBP', 'AUD', 'SGD', 'CAD'));

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
  v_projects JSONB;
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
    p.last_name,
    p.email,
    p.phone_number,
    p.avatar_url,
    p.professional_title,
    p.bio,
    p.location,
    p.portfolio_url,
    p.experience_years,
    p.skills,
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
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', ws.id,
        'skill_name', ws.skill_name,
        'proficiency', ws.proficiency,
        'proficiency_label', ws.proficiency_label,
        'category', ws.category,
        'experience_duration', ws.experience_duration
      ) ORDER BY ws.proficiency DESC
    ), '[]'::jsonb)
    INTO v_skills
    FROM public.worker_skills ws
    WHERE ws.worker_id = v_app.candidate_id
      AND (ws.category = 'top' OR ws.category IS NULL)
    LIMIT 12;

    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', wp.id,
        'title', wp.title,
        'role', wp.role,
        'year', wp.year,
        'description', wp.description,
        'skills_used', wp.skills_used
      ) ORDER BY wp.year DESC
    ), '[]'::jsonb)
    INTO v_projects
    FROM public.worker_projects wp
    WHERE wp.worker_id = v_app.candidate_id
    LIMIT 8;

    RETURN jsonb_build_object(
      'application_id', v_app.id,
      'job_id', v_app.job_id,
      'status', v_app.status,
      'match_score', v_app.match_score,
      'identity_mode', 'full',
      'candidate', to_jsonb(v_worker) || jsonb_build_object(
        'worker_skills', v_skills,
        'worker_projects', v_projects
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
