-- 1. Create worker_skills table
CREATE TABLE IF NOT EXISTS public.worker_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  proficiency INTEGER NOT NULL CHECK (proficiency >= 0 AND proficiency <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_worker_skill UNIQUE (worker_id, skill_name)
);

-- 2. Create earnings_overview table
CREATE TABLE IF NOT EXISTS public.earnings_overview (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month_name TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  is_highlighted BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_worker_month UNIQUE (worker_id, month_name)
);

-- 3. Create job_posts view
CREATE OR REPLACE VIEW public.job_posts AS
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
  cp.company_name,
  cp.logo_url
FROM public.jobs j
LEFT JOIN public.company_profiles cp ON j.employer_id = cp.employer_id;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.worker_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings_overview ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for worker_skills
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Worker skills are viewable by everyone' AND tablename = 'worker_skills'
  ) THEN
    CREATE POLICY "Worker skills are viewable by everyone" ON public.worker_skills 
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Workers can manage their own skills' AND tablename = 'worker_skills'
  ) THEN
    CREATE POLICY "Workers can manage their own skills" ON public.worker_skills 
      FOR ALL USING (auth.uid() = worker_id) WITH CHECK (auth.uid() = worker_id);
  END IF;
END $$;

-- 6. RLS Policies for earnings_overview
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Workers can view their own earnings overview' AND tablename = 'earnings_overview'
  ) THEN
    CREATE POLICY "Workers can view their own earnings overview" ON public.earnings_overview 
      FOR SELECT USING (auth.uid() = worker_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Workers can manage their own earnings overview' AND tablename = 'earnings_overview'
  ) THEN
    CREATE POLICY "Workers can manage their own earnings overview" ON public.earnings_overview 
      FOR ALL USING (auth.uid() = worker_id) WITH CHECK (auth.uid() = worker_id);
  END IF;
END $$;
