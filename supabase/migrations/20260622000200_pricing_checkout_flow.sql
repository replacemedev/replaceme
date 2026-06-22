-- Migration: Dynamic FAQ & Testimonials Schema Setup
-- Configures RLS policies and performance indexes for the checkout flow

-- 1. Create FAQs Table
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Testimonials Table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_title TEXT NOT NULL,
  author_company TEXT NOT NULL,
  avatar_url TEXT,
  display_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- 4. Create Public Select Policies
DROP POLICY IF EXISTS "FAQs are viewable by everyone" ON public.faqs;
CREATE POLICY "FAQs are viewable by everyone" ON public.faqs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Testimonials are viewable by everyone" ON public.testimonials;
CREATE POLICY "Testimonials are viewable by everyone" ON public.testimonials
  FOR SELECT USING (true);

-- 5. Create Performance Indexes for Fast Lookups
CREATE INDEX IF NOT EXISTS idx_faqs_order ON public.faqs (display_order ASC);
CREATE INDEX IF NOT EXISTS idx_testimonials_order ON public.testimonials (display_order ASC);
CREATE INDEX IF NOT EXISTS idx_employer_subscriptions_employer ON public.employer_subscriptions (employer_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_profiles_candidate_employer ON public.unlocked_profiles (candidate_id, employer_id);
