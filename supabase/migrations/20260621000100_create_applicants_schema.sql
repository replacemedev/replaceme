-- Create Applications table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Applied' NOT NULL,
    match_score INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_job_candidate UNIQUE (job_id, candidate_id)
);

-- Create Unlocked Profiles table (keeps track of who unlocked whom)
CREATE TABLE IF NOT EXISTS public.unlocked_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_employer_candidate_unlock UNIQUE (employer_id, candidate_id)
);

-- Create Employer Credits table
CREATE TABLE IF NOT EXISTS public.employer_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    credits_balance INTEGER DEFAULT 5 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unlocked_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_credits ENABLE ROW LEVEL SECURITY;

-- Drop Policies if they exist to prevent conflicts on rebuild
DROP POLICY IF EXISTS "Employers can view applicants for their jobs" ON public.applications;
DROP POLICY IF EXISTS "Employers can update applicant status for their jobs" ON public.applications;
DROP POLICY IF EXISTS "Employers can view their own unlocked profiles" ON public.unlocked_profiles;
DROP POLICY IF EXISTS "Employers can insert unlocks for themselves" ON public.unlocked_profiles;
DROP POLICY IF EXISTS "Employers can view their own credit balance" ON public.employer_credits;
DROP POLICY IF EXISTS "System/Employer can update credit balance" ON public.employer_credits;

-- RLS Policies for Applications
CREATE POLICY "Employers can view applicants for their jobs"
ON public.applications
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.jobs
        WHERE jobs.id = applications.job_id
        AND jobs.employer_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    )
);

CREATE POLICY "Employers can update applicant status for their jobs"
ON public.applications
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.jobs
        WHERE jobs.id = applications.job_id
        AND jobs.employer_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.jobs
        WHERE jobs.id = applications.job_id
        AND jobs.employer_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    )
);

-- RLS Policies for Unlocked Profiles
CREATE POLICY "Employers can view their own unlocked profiles"
ON public.unlocked_profiles
FOR SELECT
USING (
    employer_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
);

CREATE POLICY "Employers can insert unlocks for themselves"
ON public.unlocked_profiles
FOR INSERT
WITH CHECK (
    employer_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
);

-- RLS Policies for Employer Credits
CREATE POLICY "Employers can view their own credit balance"
ON public.employer_credits
FOR SELECT
USING (
    employer_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
);

CREATE POLICY "System/Employer can update credit balance"
ON public.employer_credits
FOR UPDATE
USING (
    employer_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
)
WITH CHECK (
    employer_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
);
