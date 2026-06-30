-- Universal reporting system (worker/employer -> admin)

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reporter_role TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  title TEXT NULL,
  description_markdown TEXT NOT NULL,
  reported_url TEXT NULL,
  user_agent TEXT NULL,
  app_area TEXT NULL,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  resolved_at TIMESTAMPTZ NULL,
  resolved_by UUID NULL REFERENCES public.profiles(id),
  admin_notes TEXT NULL
);

CREATE INDEX IF NOT EXISTS reports_status_created_at_idx
  ON public.reports (status, created_at DESC);

CREATE INDEX IF NOT EXISTS reports_reporter_role_created_at_idx
  ON public.reports (reporter_role, created_at DESC);

CREATE INDEX IF NOT EXISTS reports_reporter_id_created_at_idx
  ON public.reports (reporter_id, created_at DESC);

ALTER TABLE public.reports
  DROP CONSTRAINT IF EXISTS reports_category_allowed;

ALTER TABLE public.reports
  ADD CONSTRAINT reports_category_allowed
  CHECK (category IN ('bug', 'ui_error', 'malicious_user', 'feature_request', 'other'));

ALTER TABLE public.reports
  DROP CONSTRAINT IF EXISTS reports_status_allowed;

ALTER TABLE public.reports
  ADD CONSTRAINT reports_status_allowed
  CHECK (status IN ('open', 'in_progress', 'resolved'));

-- updated_at trigger (reuses existing helper if present)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'set_updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS set_reports_updated_at ON public.reports;
    CREATE TRIGGER set_reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Reporter can create only for self
DROP POLICY IF EXISTS "reports_insert_own" ON public.reports;
CREATE POLICY "reports_insert_own"
  ON public.reports
  FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

-- Reporter can read only own
DROP POLICY IF EXISTS "reports_select_own" ON public.reports;
CREATE POLICY "reports_select_own"
  ON public.reports
  FOR SELECT
  TO authenticated
  USING (reporter_id = auth.uid());

-- Admin can read all (app_metadata.role = 'admin')
DROP POLICY IF EXISTS "reports_admin_select_all" ON public.reports;
CREATE POLICY "reports_admin_select_all"
  ON public.reports
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Admin can update all
DROP POLICY IF EXISTS "reports_admin_update_all" ON public.reports;
CREATE POLICY "reports_admin_update_all"
  ON public.reports
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

