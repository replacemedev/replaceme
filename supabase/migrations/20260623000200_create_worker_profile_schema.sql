-- 1. Alter public.profiles table to add profile summary fields if they do not exist
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'Full-time',
  ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
  ADD COLUMN IF NOT EXISTS birth_year INTEGER,
  ADD COLUMN IF NOT EXISTS is_top_rated BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_remote BOOLEAN DEFAULT TRUE;

-- 2. Alter public.worker_skills table to add category and experience detail columns if they do not exist
ALTER TABLE public.worker_skills
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS experience_duration TEXT,
  ADD COLUMN IF NOT EXISTS proficiency_label TEXT;

-- 3. Create public.worker_projects table
CREATE TABLE IF NOT EXISTS public.worker_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  role TEXT NOT NULL,
  year INTEGER NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create public.employer_testimonials table
CREATE TABLE IF NOT EXISTS public.employer_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES public.company_profiles(employer_id) ON DELETE CASCADE,
  rating NUMERIC NOT NULL CHECK (rating >= 0 AND rating <= 5),
  review_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable Row Level Security (RLS) on new tables
ALTER TABLE public.worker_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_testimonials ENABLE ROW LEVEL SECURITY;

-- 6. Define RLS Policies for worker_projects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Worker projects are viewable by everyone' AND tablename = 'worker_projects'
  ) THEN
    CREATE POLICY "Worker projects are viewable by everyone" ON public.worker_projects 
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Workers can manage their own projects' AND tablename = 'worker_projects'
  ) THEN
    CREATE POLICY "Workers can manage their own projects" ON public.worker_projects 
      FOR ALL USING (auth.uid() = worker_id) WITH CHECK (auth.uid() = worker_id);
  END IF;
END $$;

-- 7. Define RLS Policies for employer_testimonials
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Employer testimonials are viewable by everyone' AND tablename = 'employer_testimonials'
  ) THEN
    CREATE POLICY "Employer testimonials are viewable by everyone" ON public.employer_testimonials 
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Employers can manage their own testimonials' AND tablename = 'employer_testimonials'
  ) THEN
    CREATE POLICY "Employers can manage their own testimonials" ON public.employer_testimonials 
      FOR ALL USING (auth.uid() = employer_id) WITH CHECK (auth.uid() = employer_id);
  END IF;
END $$;
