-- Migration: Pinned Workers Schema Setup
-- Alters public.profiles to add experience_years and hourly_rate.
-- Creates public.pinned_workers table with strict RLS policies.

-- 1. Add experience_years and hourly_rate to profiles table if not present
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience_years INTEGER CHECK (experience_years >= 0);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC CHECK (hourly_rate >= 0);

-- 2. Create Pinned Workers Join Table
CREATE TABLE IF NOT EXISTS public.pinned_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pinned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_employer_worker_pin UNIQUE (employer_id, worker_id)
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.pinned_workers ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for Pinned Workers
DROP POLICY IF EXISTS "Employers can view their own pinned workers" ON public.pinned_workers;
CREATE POLICY "Employers can view their own pinned workers" ON public.pinned_workers
  FOR SELECT USING (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Employers can pin workers for themselves" ON public.pinned_workers;
CREATE POLICY "Employers can pin workers for themselves" ON public.pinned_workers
  FOR INSERT WITH CHECK (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Employers can unpin workers for themselves" ON public.pinned_workers;
CREATE POLICY "Employers can unpin workers for themselves" ON public.pinned_workers
  FOR DELETE USING (auth.uid() = employer_id);

-- 5. Create Performance Indexes for Fast Lookups
CREATE INDEX IF NOT EXISTS idx_pinned_workers_employer ON public.pinned_workers (employer_id);
CREATE INDEX IF NOT EXISTS idx_pinned_workers_worker ON public.pinned_workers (worker_id);
