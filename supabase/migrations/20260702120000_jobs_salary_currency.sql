-- Employer job posting currency (workers see employer-selected currency on listings)

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS salary_currency TEXT NOT NULL DEFAULT 'PHP';

ALTER TABLE public.jobs
  DROP CONSTRAINT IF EXISTS jobs_salary_currency_allowed;

ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_salary_currency_allowed
  CHECK (salary_currency IN ('PHP', 'USD', 'EUR', 'GBP', 'AUD', 'SGD', 'CAD'));

DROP VIEW IF EXISTS public.job_posts;

CREATE VIEW public.job_posts AS
SELECT
  j.id,
  j.employer_id,
  j.title,
  j.employment_type,
  j.description,
  j.monthly_salary,
  j.salary_currency,
  j.hours_per_week,
  j.skills,
  j.status,
  j.is_premium_path,
  j.created_at,
  j.updated_at,
  j.location,
  cp.company_name,
  cp.logo_url
FROM public.jobs j
LEFT JOIN public.company_profiles cp ON j.employer_id = cp.employer_id;
