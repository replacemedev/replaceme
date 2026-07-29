-- Remove interview scheduling: backfill status, drop interviews table, remove INTERVIEW_SCHEDULED enum value

UPDATE public.applications
SET status = 'UNDER_REVIEW'::public.application_status
WHERE status = 'INTERVIEW_SCHEDULED'::public.application_status;

DROP TRIGGER IF EXISTS interviews_updated_at ON public.interviews;
DROP TABLE IF EXISTS public.interviews CASCADE;
DROP TYPE IF EXISTS public.interview_status;

DROP VIEW IF EXISTS public.job_applications;

DROP TRIGGER IF EXISTS applications_notify_worker_status ON public.applications;
DROP TRIGGER IF EXISTS applications_stage_history ON public.applications;

CREATE TYPE public.application_status_new AS ENUM (
  'PENDING',
  'UNDER_REVIEW',
  'REJECTED',
  'HIRED',
  'WITHDRAWN'
);

ALTER TABLE public.applications
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE public.applications
  ALTER COLUMN status TYPE public.application_status_new
  USING (
    CASE status::text
      WHEN 'PENDING' THEN 'PENDING'::public.application_status_new
      WHEN 'UNDER_REVIEW' THEN 'UNDER_REVIEW'::public.application_status_new
      WHEN 'REJECTED' THEN 'REJECTED'::public.application_status_new
      WHEN 'HIRED' THEN 'HIRED'::public.application_status_new
      WHEN 'WITHDRAWN' THEN 'WITHDRAWN'::public.application_status_new
      ELSE 'PENDING'::public.application_status_new
    END
  );

DROP TYPE public.application_status;
ALTER TYPE public.application_status_new RENAME TO application_status;

ALTER TABLE public.applications
  ALTER COLUMN status SET DEFAULT 'PENDING'::public.application_status;

COMMENT ON TYPE public.application_status IS
  'Shared worker/employer application lifecycle statuses (messaging-first; no interview stage)';

CREATE OR REPLACE VIEW public.job_applications
WITH (security_invoker = true) AS
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

CREATE TRIGGER applications_notify_worker_status
  AFTER UPDATE OF status ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION trg_notify_worker_application_status();

CREATE TRIGGER applications_stage_history
  AFTER INSERT OR UPDATE OF status ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION log_application_stage_change();
