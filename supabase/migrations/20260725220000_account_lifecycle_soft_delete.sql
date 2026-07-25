-- Account lifecycle: soft delete, timed suspension, deletion grace, legal hold.
-- Adds columns only; worker_profiles view is unchanged (filter at query layer).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS suspension_ends_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS deletion_scheduled_for timestamptz NULL,
  ADD COLUMN IF NOT EXISTS legal_hold boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.deleted_at IS
  'When set, the account is soft-deleted (hidden from active listings). Null means not deleted.';

COMMENT ON COLUMN public.profiles.suspension_ends_at IS
  'Scheduled end of suspension. Null while account_status = suspended means indefinite suspension.';

COMMENT ON COLUMN public.profiles.deletion_scheduled_for IS
  'Grace-period deadline after which eligible erasure may proceed. Null when no deletion is scheduled.';

COMMENT ON COLUMN public.profiles.legal_hold IS
  'When true, retention/erasure is blocked pending legal or compliance review.';

CREATE INDEX IF NOT EXISTS profiles_active_not_deleted_idx
  ON public.profiles (id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS profiles_suspension_ends_at_idx
  ON public.profiles (suspension_ends_at)
  WHERE suspension_ends_at IS NOT NULL
    AND account_status = 'suspended';

CREATE INDEX IF NOT EXISTS profiles_deletion_scheduled_for_idx
  ON public.profiles (deletion_scheduled_for)
  WHERE deletion_scheduled_for IS NOT NULL
    AND deleted_at IS NULL;
