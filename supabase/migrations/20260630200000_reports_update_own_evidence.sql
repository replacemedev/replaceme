-- Reporters must UPDATE their own report after evidence upload (was INSERT-only → silent metadata loss)

DROP POLICY IF EXISTS "reports_update_own" ON public.reports;

CREATE POLICY "reports_update_own"
  ON public.reports FOR UPDATE
  USING (reporter_id = auth.uid())
  WITH CHECK (reporter_id = auth.uid());

-- Backfill orphaned storage objects into reports.evidence_storage_path
UPDATE public.reports r
SET
  evidence_storage_path = o.name,
  evidence_mime_type = CASE
    WHEN o.name LIKE '%.png' THEN 'image/png'
    ELSE 'image/jpeg'
  END
FROM storage.objects o
WHERE o.bucket_id = 'report-evidence'
  AND o.name LIKE r.reporter_id::text || '/' || r.id::text || '.%'
  AND r.evidence_storage_path IS NULL;

UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/jpg']
WHERE id IN ('profile-avatars', 'company-logos', 'report-evidence');
