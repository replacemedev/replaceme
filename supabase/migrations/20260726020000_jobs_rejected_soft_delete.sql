-- Distinguish admin rejections from employer-closed jobs; soft-delete for audit trail
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

COMMENT ON COLUMN public.jobs.deleted_at IS
  'Soft-delete timestamp for admin removals (audit). NULL = not deleted.';
COMMENT ON COLUMN public.jobs.deleted_by IS
  'Admin who soft-deleted the job.';
COMMENT ON COLUMN public.jobs.deletion_reason IS
  'Optional audit reason for soft-delete.';

-- Backfill prior moderation rejects (Closed + rejection_category) to Rejected
UPDATE public.jobs
SET status = 'Rejected'
WHERE rejection_category IS NOT NULL
  AND status = 'Closed'
  AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_deleted_at
  ON public.jobs (deleted_at)
  WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_status_rejected
  ON public.jobs (status, created_at DESC)
  WHERE status = 'Rejected';

-- Public board view: never expose soft-deleted rows
DROP VIEW IF EXISTS public.job_posts;
CREATE VIEW public.job_posts
WITH (security_invoker = true)
AS
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
LEFT JOIN public.company_profiles cp ON j.employer_id = cp.employer_id
WHERE j.deleted_at IS NULL;
