-- Migration to ensure dynamic currency support is fully enabled across billing & profiles

ALTER TABLE public.employer_subscriptions
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'usd';
