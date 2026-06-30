-- Report evidence attachments (private bucket, reporter-owned writes)

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS evidence_storage_path TEXT NULL,
  ADD COLUMN IF NOT EXISTS evidence_mime_type TEXT NULL,
  ADD COLUMN IF NOT EXISTS evidence_file_size_bytes INTEGER NULL;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-evidence',
  'report-evidence',
  FALSE,
  5242880,
  ARRAY['image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Reporters upload own report evidence" ON storage.objects;
DROP POLICY IF EXISTS "Reporters read own report evidence" ON storage.objects;
DROP POLICY IF EXISTS "Admins read report evidence" ON storage.objects;

CREATE POLICY "Reporters upload own report evidence"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'report-evidence'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Reporters read own report evidence"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'report-evidence'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins read report evidence"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'report-evidence'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
