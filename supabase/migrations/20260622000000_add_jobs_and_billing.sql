-- Migration: Add Jobs and Billing/Subscription Tables
-- File: supabase/migrations/20260622000000_add_jobs_and_billing.sql

-- 1. Create Billing Plans Table
CREATE TABLE IF NOT EXISTS public.billing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL, -- 'Discovery', 'Essential', 'Professional'
    price NUMERIC NOT NULL CHECK (price >= 0),
    job_post_limit INTEGER NOT NULL CHECK (job_post_limit >= 0),
    candidate_unlocks INTEGER NOT NULL CHECK (candidate_unlocks >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Employer Subscriptions Table
CREATE TABLE IF NOT EXISTS public.employer_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.billing_plans(id) ON DELETE SET NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    status TEXT NOT NULL DEFAULT 'inactive', -- 'active', 'trialing', 'past_due', 'canceled', 'unpaid', 'inactive'
    current_period_end TIMESTAMP WITH TIME ZONE,
    job_posts_used INTEGER DEFAULT 0 NOT NULL CHECK (job_posts_used >= 0),
    unlocks_used INTEGER DEFAULT 0 NOT NULL CHECK (unlocks_used >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Jobs Table (if not exists; referencing profiles directly for employer_id)
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    employment_type TEXT NOT NULL,
    description TEXT NOT NULL,
    monthly_salary NUMERIC NOT NULL CHECK (monthly_salary >= 0),
    hours_per_week NUMERIC NOT NULL CHECK (hours_per_week >= 0),
    skills TEXT[] DEFAULT '{}'::text[] NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending Review', -- 'Active', 'Closed', 'Pending Review', 'Draft'
    is_premium_path BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- 5. Indexes for Performance Optimization
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON public.jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_employer_subscriptions_employer_id ON public.employer_subscriptions(employer_id);
CREATE INDEX IF NOT EXISTS idx_employer_subscriptions_plan_id ON public.employer_subscriptions(plan_id);

-- 6. Row Level Security Policies

-- A. Billing Plans Policies
CREATE POLICY "Billing plans are viewable by everyone"
ON public.billing_plans FOR SELECT
USING (true);

-- B. Employer Subscriptions Policies
CREATE POLICY "Employers can view their own subscription"
ON public.employer_subscriptions FOR SELECT
USING (auth.uid() = employer_id);

CREATE POLICY "Employers can update their own subscription"
ON public.employer_subscriptions FOR UPDATE
USING (auth.uid() = employer_id)
WITH CHECK (auth.uid() = employer_id);

-- System/Service Role can manage subscriptions (implicit in Supabase, but policies define tenant boundaries)

-- C. Jobs Policies
CREATE POLICY "Employers can view their own jobs"
ON public.jobs FOR SELECT
USING (auth.uid() = employer_id);

CREATE POLICY "Employers can insert their own jobs"
ON public.jobs FOR INSERT
WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update their own jobs"
ON public.jobs FOR UPDATE
USING (auth.uid() = employer_id)
WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can delete their own jobs"
ON public.jobs FOR DELETE
USING (auth.uid() = employer_id);

CREATE POLICY "Anyone can view active jobs"
ON public.jobs FOR SELECT
USING (status = 'Active');

-- 7. Seed Data for Billing Plans
INSERT INTO public.billing_plans (name, price, job_post_limit, candidate_unlocks)
VALUES 
  ('Discovery', 0, 1, 5),
  ('Essential', 49.00, 3, 25),
  ('Professional', 149.00, 10, 100)
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  job_post_limit = EXCLUDED.job_post_limit,
  candidate_unlocks = EXCLUDED.candidate_unlocks;
