-- Rename needs_update → resubmission_required (system status terminology).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'verification_status'
      AND e.enumlabel = 'needs_update'
  ) THEN
    ALTER TYPE public.verification_status RENAME VALUE 'needs_update' TO 'resubmission_required';
  ELSIF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'verification_status'
      AND e.enumlabel = 'resubmission_required'
  ) THEN
    ALTER TYPE public.verification_status ADD VALUE 'resubmission_required';
  END IF;
END $$;

COMMENT ON COLUMN public.profiles.kyc_rejection_reason IS
  'Admin feedback when verification_status is rejected or resubmission_required; cleared on re-submit or approval.';
