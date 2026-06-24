-- Profile assets for application preview + application form payload on applications table.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS resume_url TEXT,
  ADD COLUMN IF NOT EXISTS cv_url TEXT,
  ADD COLUMN IF NOT EXISTS phone_number TEXT;

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS application_subject TEXT,
  ADD COLUMN IF NOT EXISTS cover_letter TEXT,
  ADD COLUMN IF NOT EXISTS contact_methods JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.applications.application_subject IS 'Worker-provided subject line at apply time';
COMMENT ON COLUMN public.applications.cover_letter IS 'Worker cover letter / message at apply time';
COMMENT ON COLUMN public.applications.contact_methods IS 'JSON array of {type, value} contact methods submitted with application';

-- Semantic alias: job_applications maps to the canonical applications table.
CREATE OR REPLACE VIEW public.job_applications AS
SELECT
  id,
  job_id,
  candidate_id AS worker_id,
  application_subject,
  cover_letter,
  contact_methods,
  status,
  match_score,
  created_at
FROM public.applications;

COMMENT ON VIEW public.job_applications IS 'Worker job applications (read alias of applications)';
