-- Standardize application status as a strict PostgreSQL enum (single source of truth).
DO $$ BEGIN
  CREATE TYPE public.application_status AS ENUM (
    'PENDING',
    'UNDER_REVIEW',
    'INTERVIEW_SCHEDULED',
    'REJECTED',
    'HIRED'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.applications
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE public.applications
  ALTER COLUMN status TYPE public.application_status
  USING (
    CASE status::text
      WHEN 'Applied' THEN 'PENDING'::public.application_status
      WHEN 'Shortlisted' THEN 'UNDER_REVIEW'::public.application_status
      WHEN 'Interviewing' THEN 'INTERVIEW_SCHEDULED'::public.application_status
      WHEN 'Rejected' THEN 'REJECTED'::public.application_status
      WHEN 'Hired' THEN 'HIRED'::public.application_status
      WHEN 'PENDING' THEN 'PENDING'::public.application_status
      WHEN 'UNDER_REVIEW' THEN 'UNDER_REVIEW'::public.application_status
      WHEN 'INTERVIEW_SCHEDULED' THEN 'INTERVIEW_SCHEDULED'::public.application_status
      WHEN 'REJECTED' THEN 'REJECTED'::public.application_status
      WHEN 'HIRED' THEN 'HIRED'::public.application_status
      ELSE 'PENDING'::public.application_status
    END
  );

ALTER TABLE public.applications
  ALTER COLUMN status SET DEFAULT 'PENDING'::public.application_status;

COMMENT ON TYPE public.application_status IS 'Shared worker/employer application lifecycle statuses';
