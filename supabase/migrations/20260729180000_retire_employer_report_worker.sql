-- Retire employer → worker U2U reports.
-- Keep platform/job reports and worker → employer safety reports.

-- 1) Close historical open cases so workers no longer appear as defendants in active queues.
UPDATE public.user_reports ur
SET
  status = 'dismissed',
  case_stage = COALESCE(ur.case_stage, 'closed'),
  admin_notes = COALESCE(
    NULLIF(TRIM(ur.admin_notes), ''),
    'Auto-dismissed: employer→worker reporting retired (2026-07-29).'
  ),
  reviewed_at = COALESCE(ur.reviewed_at, timezone('utc'::text, now())),
  updated_at = timezone('utc'::text, now())
FROM public.profiles reported
WHERE ur.reported_user_id = reported.id
  AND reported.role = 'worker'
  AND ur.status IN ('open', 'investigating');

-- 2) RLS: authenticated users may only file reports against employers (not workers).
DROP POLICY IF EXISTS "user_reports_insert_own" ON public.user_reports;
CREATE POLICY "user_reports_insert_own"
  ON public.user_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    reporter_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = reported_user_id
        AND p.role = 'employer'
    )
  );

COMMENT ON TABLE public.user_reports IS
  'Confidential T&S reports. Workers may report employers; employer→worker reporting is retired. Reporter identity must never be exposed to the reported user (RA 10173 / GDPR).';
