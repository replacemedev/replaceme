-- Migration: Create Job Reports System Schema
-- File: supabase_migration_reports.sql

CREATE TABLE IF NOT EXISTS public.reported_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL CONSTRAINT fk_reported_jobs_job REFERENCES public.jobs(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL CONSTRAINT fk_reported_jobs_reporter REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  admin_notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT reported_jobs_status_allowed CHECK (status IN ('PENDING', 'REVIEWED', 'DISMISSED'))
);

-- Enable RLS
ALTER TABLE public.reported_jobs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "authenticated_insert_own_reported_jobs" ON public.reported_jobs;
DROP POLICY IF EXISTS "authenticated_select_own_reported_jobs" ON public.reported_jobs;
DROP POLICY IF EXISTS "admin_select_all_reported_jobs" ON public.reported_jobs;
DROP POLICY IF EXISTS "admin_update_all_reported_jobs" ON public.reported_jobs;

-- 1. Workers can insert their own reports
CREATE POLICY "authenticated_insert_own_reported_jobs"
  ON public.reported_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

-- 2. Workers can select their own reports
CREATE POLICY "authenticated_select_own_reported_jobs"
  ON public.reported_jobs
  FOR SELECT
  TO authenticated
  USING (reporter_id = auth.uid());

-- 3. Admins can view all reported jobs
CREATE POLICY "admin_select_all_reported_jobs"
  ON public.reported_jobs
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 4. Admins can update reported jobs
CREATE POLICY "admin_update_all_reported_jobs"
  ON public.reported_jobs
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_reported_jobs_job_id ON public.reported_jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_reported_jobs_reporter_id ON public.reported_jobs(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reported_jobs_status_created ON public.reported_jobs(status, created_at DESC);

-- Trigger for updated_at
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'set_updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS set_reported_jobs_updated_at ON public.reported_jobs;
    CREATE TRIGGER set_reported_jobs_updated_at
    BEFORE UPDATE ON public.reported_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;
