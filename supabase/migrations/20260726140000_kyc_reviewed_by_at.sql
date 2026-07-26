-- Admin attribution for KYC decisions (queue "Reviewed By" column).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS kyc_reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS kyc_reviewed_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.kyc_reviewed_by IS
  'Admin profile id who last approved, rejected, or required KYC resubmission.';
COMMENT ON COLUMN public.profiles.kyc_reviewed_at IS
  'Timestamp of the last KYC review decision.';

CREATE INDEX IF NOT EXISTS profiles_kyc_reviewed_by_idx
  ON public.profiles (kyc_reviewed_by)
  WHERE kyc_reviewed_by IS NOT NULL;
