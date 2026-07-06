-- Standardize interview_status enum if not exists
DO $$ BEGIN
  CREATE TYPE public.interview_status AS ENUM (
    'scheduled',
    'completed',
    'cancelled',
    'no_show'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Drop table interviews if exists to recreate exactly as requested
DROP TABLE IF EXISTS public.interviews CASCADE;

CREATE TABLE public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  meeting_link TEXT,
  status public.interview_status DEFAULT 'scheduled'::public.interview_status NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT interviews_application_unique UNIQUE (application_id)
);

-- Enable RLS
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- Drop old policies if any
DROP POLICY IF EXISTS "Employers and workers read own interviews" ON public.interviews;
DROP POLICY IF EXISTS "Employers manage interviews for own jobs" ON public.interviews;

-- Create Select policy
CREATE POLICY "Employers and workers read own interviews" ON public.interviews
  FOR SELECT
  USING (
    employer_id = auth.uid()
    OR worker_id = auth.uid()
    OR public.is_admin()
  );

-- Create Insert/Update/Delete policy for Employers
CREATE POLICY "Employers manage interviews for own jobs" ON public.interviews
  FOR ALL
  USING (employer_id = auth.uid())
  WITH CHECK (employer_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_interviews_employer_scheduled ON public.interviews (employer_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_interviews_worker_scheduled ON public.interviews (worker_id, scheduled_at DESC);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS interviews_updated_at ON public.interviews;
CREATE TRIGGER interviews_updated_at
  BEFORE UPDATE ON public.interviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
