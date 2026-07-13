-- Migration: Add employment status and badge visibility fields to contracts and applications
-- Date: 2026-07-13

-- Add columns to public.contracts
ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS employment_status TEXT,
ADD COLUMN IF NOT EXISTS show_hired_badge BOOLEAN DEFAULT TRUE NOT NULL;

-- Add columns to public.applications
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS employment_status TEXT,
ADD COLUMN IF NOT EXISTS show_hired_badge BOOLEAN DEFAULT TRUE NOT NULL;
