-- Compliant job moderation audit fields (DOLE fair recruitment / platform Trust & Safety)
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS rejection_category TEXT,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.jobs
  DROP CONSTRAINT IF EXISTS jobs_rejection_category_allowed;

ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_rejection_category_allowed
  CHECK (
    rejection_category IS NULL OR rejection_category IN (
      'discriminatory_language',
      'below_minimum_wage',
      'spam_scam',
      'tos_violation',
      'misleading_incomplete',
      'prohibited_content',
      'other'
    )
  );

COMMENT ON COLUMN public.jobs.rejection_category IS
  'Admin moderation reason category (audit + employer notice). Aligned to DOLE fair recruitment / platform TOS.';
COMMENT ON COLUMN public.jobs.rejection_reason IS
  'Optional free-text explanation shown to employer and stored for audit.';
COMMENT ON COLUMN public.jobs.rejected_at IS
  'When the job was rejected by moderation.';
COMMENT ON COLUMN public.jobs.rejected_by IS
  'Admin profile id who rejected the job.';
