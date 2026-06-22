-- Database migration for Hired Workers Contracts
-- Creates the contracts table, sets up RLS policies, and creates indices.

CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  hourly_rate NUMERIC NOT NULL CHECK (hourly_rate >= 0),
  weekly_hours NUMERIC NOT NULL CHECK (weekly_hours >= 0),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  employment_type TEXT NOT NULL CHECK (employment_type IN ('full-time', 'part-time', 'contract')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'terminated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Select Policies
CREATE POLICY "Employers can view their own contracts" 
  ON public.contracts 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = employer_id);

CREATE POLICY "Workers can view their own contracts" 
  ON public.contracts 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = worker_id);

-- Insert Policy
CREATE POLICY "Employers can insert their own contracts" 
  ON public.contracts 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = employer_id);

-- Update Policy
CREATE POLICY "Employers can update their own contracts" 
  ON public.contracts 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = employer_id) 
  WITH CHECK (auth.uid() = employer_id);

-- Delete Policy
CREATE POLICY "Employers can delete their own contracts" 
  ON public.contracts 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = employer_id);

-- Indexing for performant query aggregation
CREATE INDEX IF NOT EXISTS idx_contracts_employer_id ON public.contracts(employer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_worker_id ON public.contracts(worker_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);
