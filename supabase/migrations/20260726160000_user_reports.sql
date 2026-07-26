-- Bidirectional user-to-user Trust & Safety reports (worker ↔ employer).
-- Reporter identity is admin-only via RLS (reported party cannot SELECT).

CREATE TABLE IF NOT EXISTS public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID NULL REFERENCES public.jobs(id) ON DELETE SET NULL,
  violation_category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_storage_path TEXT NULL,
  evidence_mime_type TEXT NULL,
  evidence_file_size_bytes INTEGER NULL,
  admin_notes TEXT NULL,
  reviewed_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ NULL,
  CONSTRAINT user_reports_reporter_ne_reported CHECK (reporter_id <> reported_user_id)
);

CREATE INDEX IF NOT EXISTS user_reports_status_created_at_idx
  ON public.user_reports (status, created_at DESC);

CREATE INDEX IF NOT EXISTS user_reports_reported_user_id_idx
  ON public.user_reports (reported_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS user_reports_reporter_id_idx
  ON public.user_reports (reporter_id, created_at DESC);

CREATE INDEX IF NOT EXISTS user_reports_violation_category_idx
  ON public.user_reports (violation_category, created_at DESC);

ALTER TABLE public.user_reports
  DROP CONSTRAINT IF EXISTS user_reports_violation_category_allowed;

ALTER TABLE public.user_reports
  ADD CONSTRAINT user_reports_violation_category_allowed
  CHECK (violation_category IN (
    'scam_fraud',
    'payment_circumvention',
    'harassment',
    'wage_dispute',
    'identity_misrepresentation',
    'spam_misleading',
    'other'
  ));

ALTER TABLE public.user_reports
  DROP CONSTRAINT IF EXISTS user_reports_status_allowed;

ALTER TABLE public.user_reports
  ADD CONSTRAINT user_reports_status_allowed
  CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed'));

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS set_user_reports_updated_at ON public.user_reports;
    CREATE TRIGGER set_user_reports_updated_at
      BEFORE UPDATE ON public.user_reports
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_reports_insert_own" ON public.user_reports;
CREATE POLICY "user_reports_insert_own"
  ON public.user_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

DROP POLICY IF EXISTS "user_reports_select_own" ON public.user_reports;
CREATE POLICY "user_reports_select_own"
  ON public.user_reports
  FOR SELECT
  TO authenticated
  USING (reporter_id = auth.uid());

DROP POLICY IF EXISTS "user_reports_admin_select_all" ON public.user_reports;
CREATE POLICY "user_reports_admin_select_all"
  ON public.user_reports
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "user_reports_admin_update_all" ON public.user_reports;
CREATE POLICY "user_reports_admin_update_all"
  ON public.user_reports
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

COMMENT ON TABLE public.user_reports IS
  'Confidential T&S user-to-user reports. Reporter identity must never be exposed to the reported user (RA 10173 / GDPR).';
