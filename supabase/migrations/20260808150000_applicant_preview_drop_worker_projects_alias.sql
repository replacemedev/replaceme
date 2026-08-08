-- Remove legacy worker_projects key from employer applicant preview payload.
CREATE OR REPLACE FUNCTION public.get_applicant_preview(
  p_application_id uuid,
  p_employer_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    p.id, p.first_name, p.middle_name, p.last_name, p.suffix, p.full_name,
    p.email, p.avatar_url, p.professional_title, p.bio, p.location, p.portfolio_url,
    p.experience_years, p.skills, p.spoken_languages, p.resume_url, p.cv_url,
    p.is_verified, p.expected_salary_min, p.expected_salary_max, p.salary_currency,
    p.hourly_rate, p.availability
  INTO v_worker
  FROM public.profiles p
  WHERE p.id = v_app.candidate_id;

  IF v_full THEN
    SELECT COALESCE(jsonb_agg(skill_row), '[]'::jsonb) INTO v_skills
    FROM (
      SELECT jsonb_build_object(
        'id', ws.id, 'skill_name', ws.skill_name, 'proficiency', ws.proficiency,
        'proficiency_label', ws.proficiency_label, 'category', ws.category,
        'experience_duration', ws.experience_duration
      ) AS skill_row
      FROM public.worker_skills ws
      WHERE ws.worker_id = v_app.candidate_id
        AND (ws.category = 'top' OR ws.category IS NULL)
      ORDER BY ws.proficiency DESC LIMIT 12
    ) ranked_skills;

    SELECT COALESCE(jsonb_agg(exp_row), '[]'::jsonb) INTO v_experiences
    FROM (
      SELECT jsonb_build_object(
        'id', je.id, 'company_name', je.company_name, 'role_title', je.role_title,
        'start_date', je.start_date, 'end_date', je.end_date,
        'description', je.description, 'skills_used', je.skills_used
      ) AS exp_row
      FROM public.job_experiences je
      WHERE je.worker_id = v_app.candidate_id
      ORDER BY je.start_date DESC NULLS LAST LIMIT 8
    ) ranked_experiences;

    RETURN jsonb_build_object(
      'application_id', v_app.id, 'job_id', v_app.job_id, 'status', v_app.status,
      'match_score', v_app.match_score, 'identity_mode', 'full',
      'candidate', COALESCE(to_jsonb(v_worker), '{}'::jsonb) || jsonb_build_object(
        'worker_skills', v_skills,
        'job_experiences', v_experiences
      )
    );
  END IF;

  RETURN jsonb_build_object(
    'application_id', v_app.id, 'job_id', v_app.job_id, 'status', v_app.status,
    'match_score', v_app.match_score, 'identity_mode', 'anonymous_preview',
    'candidate', jsonb_build_object(
      'id', v_worker.id, 'skills', v_worker.skills,
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
$function$;

COMMENT ON FUNCTION public.get_applicant_preview(UUID, UUID) IS
  'Employer applicant preview with job_experiences and spoken_languages.';
