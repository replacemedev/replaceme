-- Add location to jobs and refresh job_posts view; add worker saved jobs for bookmarks.
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Remote';

DROP VIEW IF EXISTS public.job_posts;

CREATE VIEW public.job_posts AS
SELECT
  j.id,
  j.employer_id,
  j.title,
  j.employment_type,
  j.description,
  j.monthly_salary,
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

CREATE TABLE IF NOT EXISTS public.worker_saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT worker_saved_jobs_unique UNIQUE (worker_id, job_id)
);

CREATE INDEX IF NOT EXISTS worker_saved_jobs_worker_id_idx
  ON public.worker_saved_jobs(worker_id);

ALTER TABLE public.worker_saved_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workers can view their saved jobs" ON public.worker_saved_jobs;
DROP POLICY IF EXISTS "Workers can save jobs" ON public.worker_saved_jobs;
DROP POLICY IF EXISTS "Workers can unsave jobs" ON public.worker_saved_jobs;

CREATE POLICY "Workers can view their saved jobs"
  ON public.worker_saved_jobs FOR SELECT
  USING (worker_id = auth.uid());

CREATE POLICY "Workers can save jobs"
  ON public.worker_saved_jobs FOR INSERT
  WITH CHECK (worker_id = auth.uid());

CREATE POLICY "Workers can unsave jobs"
  ON public.worker_saved_jobs FOR DELETE
  USING (worker_id = auth.uid());
