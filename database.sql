-- Database Schema & RLS Setup for ReplaceMe

-- 1. Create custom enum for roles
CREATE TYPE user_role AS ENUM ('employer', 'worker', 'admin');

-- 2. Create Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'worker',
  username TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL,
  avatar_url TEXT,
  stripe_customer_id TEXT, -- Nullable, used for employers
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_auth_user UNIQUE (auth_user_id)
);

-- 3. Create Employers Table
CREATE TABLE public.employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_size TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_employer_profile UNIQUE (profile_id)
);

-- 4. Create Workers Table
CREATE TABLE public.workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_title TEXT,
  bio TEXT,
  skills TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_worker_profile UNIQUE (profile_id)
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for Profiles
-- Users can read their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = auth_user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = auth_user_id);

-- 7. RLS Policies for Employers
-- Employers can view their own employer data (via joined profile)
CREATE POLICY "Employers can view their own data" 
ON public.employers FOR SELECT 
USING (profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- Employers can update their own employer data
CREATE POLICY "Employers can update their own data" 
ON public.employers FOR UPDATE 
USING (profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- 8. RLS Policies for Workers
-- Workers can view their own worker data
CREATE POLICY "Workers can view their own data" 
ON public.workers FOR SELECT 
USING (profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- Workers can update their own worker data
CREATE POLICY "Workers can update their own data" 
ON public.workers FOR UPDATE 
USING (profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- 9. Setup Postgres Trigger for Profile Creation on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_profile_id UUID;
  user_role_val user_role;
BEGIN
  -- Cast the role from metadata, default to 'worker' if not provided or invalid
  BEGIN
    user_role_val := (new.raw_user_meta_data->>'role')::user_role;
  EXCEPTION WHEN OTHERS THEN
    user_role_val := 'worker'::user_role;
  END;

  -- Insert into profiles
  INSERT INTO public.profiles (
    auth_user_id,
    email,
    username,
    first_name,
    last_name,
    role
  ) VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    COALESCE(new.raw_user_meta_data->>'first_name', 'Unknown'),
    new.raw_user_meta_data->>'last_name',
    user_role_val
  ) RETURNING id INTO new_profile_id;

  -- Insert into specific role table
  IF user_role_val = 'employer'::user_role THEN
    INSERT INTO public.employers (profile_id, company_name)
    VALUES (new_profile_id, COALESCE(new.raw_user_meta_data->>'company_name', 'Unknown Company'));
  ELSIF user_role_val = 'worker'::user_role THEN
    INSERT INTO public.workers (profile_id)
    VALUES (new_profile_id);
  END IF;

  RETURN new;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 10. Create Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  employment_type TEXT NOT NULL,
  description TEXT NOT NULL,
  monthly_salary NUMERIC NOT NULL,
  hours_per_week NUMERIC NOT NULL,
  skills TEXT[] NOT NULL,
  notification_preference TEXT NOT NULL DEFAULT 'daily',
  status TEXT NOT NULL DEFAULT 'Pending Review',
  intent TEXT NOT NULL DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Employers can view their own jobs
DROP POLICY IF EXISTS "Employers can view their own jobs" ON public.jobs;
CREATE POLICY "Employers can view their own jobs" 
ON public.jobs FOR SELECT 
USING (employer_id IN (SELECT id FROM public.employers WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())));

-- Employers can insert their own jobs
DROP POLICY IF EXISTS "Employers can insert their own jobs" ON public.jobs;
CREATE POLICY "Employers can insert their own jobs" 
ON public.jobs FOR INSERT 
WITH CHECK (employer_id IN (SELECT id FROM public.employers WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())));

-- Employers can update their own jobs
DROP POLICY IF EXISTS "Employers can update their own jobs" ON public.jobs;
CREATE POLICY "Employers can update their own jobs" 
ON public.jobs FOR UPDATE 
USING (employer_id IN (SELECT id FROM public.employers WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())));

-- Employers can delete their own jobs
DROP POLICY IF EXISTS "Employers can delete their own jobs" ON public.jobs;
CREATE POLICY "Employers can delete their own jobs" 
ON public.jobs FOR DELETE 
USING (employer_id IN (SELECT id FROM public.employers WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())));

-- Public/Workers can view active jobs
DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;
CREATE POLICY "Anyone can view active jobs" 
ON public.jobs FOR SELECT 
USING (status = 'Active');

