-- Opt-in flag for public staff directory (name, photo, department, bio, timezone only).
ALTER TABLE public.admin_profiles
  ADD COLUMN IF NOT EXISTS directory_public boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.admin_profiles.directory_public IS
  'When true, limited staff profile fields may appear on the public /team directory.';
