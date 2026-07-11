-- Migration: Add region, province, city, and address_line_1 to public.profiles

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS province TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address_line_1 TEXT;
