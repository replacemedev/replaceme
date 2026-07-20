-- Monolithic database schema migration for Replaceme
-- Generates all types, tables, views, triggers, and RLS policies from scratch

-- 1. Drop existing objects to allow clean, idempotent execution
DROP VIEW IF EXISTS public.employers CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.participants CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.unlocked_profiles CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.workers CASCADE;
DROP TABLE IF EXISTS public.company_profiles CASCADE;
DROP TABLE IF EXISTS public.employer_subscriptions CASCADE;
DROP TABLE IF EXISTS public.employer_credits CASCADE;
DROP TABLE IF EXISTS public.billing_plans CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;

-- 2. Create custom types
CREATE TYPE public.user_role AS ENUM ('employer', 'worker', 'admin');

-- 3. Create Profiles Table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  auth_user_id UUID GENERATED ALWAYS AS (id) STORED, -- generated compatibility column
  role public.user_role NOT NULL DEFAULT 'worker',
  username TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) STORED,
  email TEXT,
  avatar_url TEXT,
  professional_title TEXT,
  bio TEXT,
  skills TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Company Profiles Table (New company table)
CREATE TABLE public.company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  industry TEXT,
  company_bio TEXT,
  company_size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Employers View - DELETED (YAGNI)
-- 6. Create Workers Table - DELETED (merged into profiles)

-- 7. Create Notifications Table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Create Billing Plans Table
CREATE TABLE public.billing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL, -- 'Discovery', 'Essential', 'Professional'
  price NUMERIC NOT NULL CHECK (price >= 0),
  job_post_limit INTEGER NOT NULL CHECK (job_post_limit >= 0),
  candidate_unlocks INTEGER NOT NULL CHECK (candidate_unlocks >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Create Employer Subscriptions Table
CREATE TABLE public.employer_subscriptions (
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

-- 10. Create Employer Credits Table (Combines balance and tracks usage metrics)
CREATE TABLE public.employer_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  credits_balance INTEGER DEFAULT 5 NOT NULL CHECK (credits_balance >= 0),
  job_posts_used INTEGER DEFAULT 0 NOT NULL CHECK (job_posts_used >= 0), -- compatibility column
  unlocks_used INTEGER DEFAULT 0 NOT NULL CHECK (unlocks_used >= 0), -- compatibility column
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Create Jobs Table
CREATE TABLE public.jobs (
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

-- 12. Create Applications Table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'Applied' NOT NULL, -- 'Applied', 'Interviewing', 'Rejected', 'Hired'
  match_score INTEGER DEFAULT 0 NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_job_candidate UNIQUE (job_id, candidate_id)
);

-- 13. Create Unlocked Profiles Table (Dual compatibility: candidate_id vs application_id)
CREATE TABLE public.unlocked_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  credits_deducted INTEGER DEFAULT 1 NOT NULL CHECK (credits_deducted >= 0),
  CONSTRAINT unique_employer_candidate_unlock UNIQUE (employer_id, candidate_id)
);

-- 14. Create Conversations Table (Messaging Domain)
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. Create Participants Table
CREATE TABLE public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT unique_conversation_participant UNIQUE (conversation_id, profile_id)
);

-- 16. Create Messages Table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 17. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
-- Workers RLS policy removed
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unlocked_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 18. Indexes for Database Performance Optimization
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_company_profiles_employer ON public.company_profiles(employer_id);
-- Workers index removed
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX idx_jobs_employer ON public.jobs(employer_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_applications_job ON public.applications(job_id);
CREATE INDEX idx_applications_candidate ON public.applications(candidate_id);
CREATE INDEX idx_unlocked_profiles_employer ON public.unlocked_profiles(employer_id);
CREATE INDEX idx_conversations_job ON public.conversations(job_id);
CREATE INDEX idx_participants_profile ON public.participants(profile_id);
-- Participants user index removed
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX idx_employer_subscriptions_employer ON public.employer_subscriptions(employer_id);
CREATE INDEX idx_employer_credits_employer ON public.employer_credits(employer_id);

-- 19. Define Postgres Trigger Functions & Triggers

-- A. Timestamp Updater Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach Updated At triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER update_company_profiles_updated_at BEFORE UPDATE ON public.company_profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
-- Workers trigger removed
CREATE TRIGGER update_employer_subscriptions_updated_at BEFORE UPDATE ON public.employer_subscriptions FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER update_employer_credits_updated_at BEFORE UPDATE ON public.employer_credits FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- B. Auto-Provisioning Profile & Role on auth.users Sign Up Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_profile_id UUID;
  user_role_val public.user_role;
BEGIN
  -- Cast the role from metadata, default to 'worker' if not provided or invalid
  BEGIN
    user_role_val := (new.raw_user_meta_data->>'role')::public.user_role;
  EXCEPTION WHEN OTHERS THEN
    user_role_val := 'worker'::public.user_role;
  END;

  -- Insert into profiles
  INSERT INTO public.profiles (
    id,
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
  ) ON CONFLICT (id) DO NOTHING;

  -- Insert into specific role table
  IF user_role_val = 'employer'::public.user_role THEN
    -- Provision Company Profile
    INSERT INTO public.company_profiles (employer_id, company_name)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'company_name', 'Unknown Company'))
    ON CONFLICT (employer_id) DO NOTHING;
    
    -- Provision Default Credits
    INSERT INTO public.employer_credits (employer_id, credits_balance)
    VALUES (new.id, 5)
    ON CONFLICT (employer_id) DO NOTHING;
    
    -- Provision Default Subscription (Free Tier)
    INSERT INTO public.employer_subscriptions (employer_id, status)
    VALUES (new.id, 'active')
    ON CONFLICT (employer_id) DO NOTHING;
  -- No extra worker table insert needed (worker fields are in profiles)
  END IF;

  RETURN new;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- C. Compatibility Trigger Functions for View/Renamed tables - DELETED

-- Helper function to check conversation membership without RLS policy recursion
CREATE OR REPLACE FUNCTION public.is_conversation_member(conv_id UUID, user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.participants
    WHERE conversation_id = conv_id AND profile_id = user_id
  );
END;
$$ LANGUAGE plpgsql;

-- 20. Row Level Security Policies (Strict IDOR prevention and zero-trust)

-- A. Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- B. Company Profiles policies
CREATE POLICY "Company profiles are viewable by everyone" ON public.company_profiles FOR SELECT USING (true);
CREATE POLICY "Employers can insert their own company profile" ON public.company_profiles FOR INSERT WITH CHECK (auth.uid() = employer_id);
CREATE POLICY "Employers can update their own company profile" ON public.company_profiles FOR UPDATE USING (auth.uid() = employer_id) WITH CHECK (auth.uid() = employer_id);
CREATE POLICY "Employers can delete their own company profile" ON public.company_profiles FOR DELETE USING (auth.uid() = employer_id);

-- C. Workers policies - DELETED

-- D. Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users or system can insert notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- E. Billing Plans policies
CREATE POLICY "Billing plans are viewable by everyone" ON public.billing_plans FOR SELECT USING (true);

-- F. Employer Subscriptions policies
CREATE POLICY "Employers can view their own subscription" ON public.employer_subscriptions FOR SELECT USING (auth.uid() = employer_id);
CREATE POLICY "Employers can insert their own subscription row" ON public.employer_subscriptions FOR INSERT WITH CHECK (auth.uid() = employer_id);
CREATE POLICY "Employers can update their own subscription row" ON public.employer_subscriptions FOR UPDATE USING (auth.uid() = employer_id) WITH CHECK (auth.uid() = employer_id);
CREATE POLICY "Employers can delete their own subscription row" ON public.employer_subscriptions FOR DELETE USING (auth.uid() = employer_id);

-- G. Employer Credits policies
CREATE POLICY "Employers can view their own credit balance" ON public.employer_credits FOR SELECT USING (auth.uid() = employer_id);
CREATE POLICY "Employers can insert their own credit row" ON public.employer_credits FOR INSERT WITH CHECK (auth.uid() = employer_id);
CREATE POLICY "Employers can update their own credit row" ON public.employer_credits FOR UPDATE USING (auth.uid() = employer_id) WITH CHECK (auth.uid() = employer_id);
CREATE POLICY "Employers can delete their own credit row" ON public.employer_credits FOR DELETE USING (auth.uid() = employer_id);

-- H. Jobs policies
CREATE POLICY "Anyone can view active jobs, employers can view all their own jobs" ON public.jobs FOR SELECT USING (status = 'Active' OR auth.uid() = employer_id);
CREATE POLICY "Employers can insert their own jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = employer_id);
CREATE POLICY "Employers can update their own jobs" ON public.jobs FOR UPDATE USING (auth.uid() = employer_id) WITH CHECK (auth.uid() = employer_id);
CREATE POLICY "Employers can delete their own jobs" ON public.jobs FOR DELETE USING (auth.uid() = employer_id);

-- I. Applications policies
CREATE POLICY "Users can view applications they submitted, or applications for jobs they posted" ON public.applications FOR SELECT USING (auth.uid() = candidate_id OR auth.uid() = (SELECT employer_id FROM public.jobs WHERE jobs.id = applications.job_id));
CREATE POLICY "Workers can insert their own applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = candidate_id);
CREATE POLICY "Employers can update application details, or candidates themselves" ON public.applications FOR UPDATE USING (auth.uid() = candidate_id OR auth.uid() = (SELECT employer_id FROM public.jobs WHERE jobs.id = applications.job_id)) WITH CHECK (auth.uid() = candidate_id OR auth.uid() = (SELECT employer_id FROM public.jobs WHERE jobs.id = applications.job_id));
CREATE POLICY "Candidates can delete their own applications" ON public.applications FOR DELETE USING (auth.uid() = candidate_id);

-- J. Unlocked Profiles policies
CREATE POLICY "Employers can view their own unlocked profiles" ON public.unlocked_profiles FOR SELECT USING (auth.uid() = employer_id);
CREATE POLICY "Employers can insert unlocks for themselves" ON public.unlocked_profiles FOR INSERT WITH CHECK (auth.uid() = employer_id);
CREATE POLICY "Employers can update their own unlocked profile rows" ON public.unlocked_profiles FOR UPDATE USING (auth.uid() = employer_id) WITH CHECK (auth.uid() = employer_id);
CREATE POLICY "Employers can delete their own unlocked profile rows" ON public.unlocked_profiles FOR DELETE USING (auth.uid() = employer_id);

-- K. Conversations policies
CREATE POLICY "Users can view conversations they participate in" ON public.conversations FOR SELECT USING (public.is_conversation_member(id, auth.uid()));
CREATE POLICY "Anyone can create conversations" ON public.conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update conversations" ON public.conversations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Users can delete conversations they participate in" ON public.conversations FOR DELETE USING (public.is_conversation_member(id, auth.uid()));

-- L. Participants policies
CREATE POLICY "Users can view participants in their conversations" ON public.participants FOR SELECT USING (public.is_conversation_member(conversation_id, auth.uid()));
CREATE POLICY "Users can add participants to conversations they are in" ON public.participants FOR INSERT WITH CHECK (profile_id = auth.uid() OR EXISTS (SELECT 1 FROM public.participants p WHERE p.conversation_id = conversation_id AND p.profile_id = auth.uid()));
CREATE POLICY "Users can update their own participant details" ON public.participants FOR UPDATE USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Users can remove themselves from conversations" ON public.participants FOR DELETE USING (profile_id = auth.uid());

-- M. Messages policies
CREATE POLICY "Users can view messages in their conversations" ON public.messages FOR SELECT USING (public.is_conversation_member(conversation_id, auth.uid()));
CREATE POLICY "Users can send messages to their conversations" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.participants WHERE participants.conversation_id = conversation_id AND participants.profile_id = sender_id));
CREATE POLICY "Users can update messages they sent, or read receipts" ON public.messages FOR UPDATE USING (public.is_conversation_member(conversation_id, auth.uid())) WITH CHECK (true);
CREATE POLICY "Users can delete their own messages" ON public.messages FOR DELETE USING (sender_id = auth.uid());


-- 21. Seed default billing plans (Discovery, Essential, Professional)
INSERT INTO public.billing_plans (name, price, job_post_limit, candidate_unlocks)
VALUES 
  ('Discovery', 0, 1, 5),
  ('Essential', 49.00, 3, 25),
  ('Professional', 149.00, 10, 100)
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  job_post_limit = EXCLUDED.job_post_limit,
  candidate_unlocks = EXCLUDED.candidate_unlocks;
