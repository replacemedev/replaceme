-- Admin Trust & Safety moderation fields for job applications.
-- Keeps hiring pipeline status (PENDING…HIRED) separate from platform moderation.

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'clear',
  ADD COLUMN IF NOT EXISTS flagged_at timestamptz,
  ADD COLUMN IF NOT EXISTS flag_reason text,
  ADD COLUMN IF NOT EXISTS flagged_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'applications_moderation_status_check'
  ) THEN
    ALTER TABLE public.applications
      ADD CONSTRAINT applications_moderation_status_check
      CHECK (moderation_status IN ('clear', 'flagged', 'suspended'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_applications_moderation_status
  ON public.applications (moderation_status)
  WHERE moderation_status <> 'clear';

CREATE INDEX IF NOT EXISTS idx_applications_created_at_desc
  ON public.applications (created_at DESC);

COMMENT ON COLUMN public.applications.moderation_status IS
  'Platform Trust & Safety state: clear | flagged | suspended. Independent of application_status.';
