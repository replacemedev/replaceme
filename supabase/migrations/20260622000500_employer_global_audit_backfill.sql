-- Migration: Employer Global Audit Backfill
-- File: supabase/migrations/20260622000500_employer_global_audit_backfill.sql

-- 1. Add missing metrics and hiring team columns to public.jobs table
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0 NOT NULL CHECK (views_count >= 0),
  ADD COLUMN IF NOT EXISTS clicks_count INTEGER DEFAULT 0 NOT NULL CHECK (clicks_count >= 0),
  ADD COLUMN IF NOT EXISTS hiring_manager_name TEXT DEFAULT 'Sarah Jenkins',
  ADD COLUMN IF NOT EXISTS hiring_manager_role TEXT DEFAULT 'Lead Recruiter',
  ADD COLUMN IF NOT EXISTS hiring_manager_email TEXT DEFAULT 'recruiting@replaceme.com';

-- 2. Create SECURE database helper functions to increment job metrics via RPC
CREATE OR REPLACE FUNCTION public.increment_job_views(target_job_id UUID)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.jobs
  SET views_count = views_count + 1
  WHERE id = target_job_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.increment_job_clicks(target_job_id UUID)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.jobs
  SET clicks_count = clicks_count + 1
  WHERE id = target_job_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Grant execute permissions on functions to authenticated and anonymous public users
GRANT EXECUTE ON FUNCTION public.increment_job_views(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_job_clicks(UUID) TO anon, authenticated;
