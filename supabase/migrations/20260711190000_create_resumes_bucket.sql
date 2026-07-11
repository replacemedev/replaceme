-- Create a private resumes bucket with a 5MB size limit and PDF restriction.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  FALSE,
  5242880, -- 5MB in bytes
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop existing policies if they exist.
DROP POLICY IF EXISTS "Workers upload own resume files" ON storage.objects;
DROP POLICY IF EXISTS "Workers update own resume files" ON storage.objects;
DROP POLICY IF EXISTS "Workers delete own resume files" ON storage.objects;
DROP POLICY IF EXISTS "Workers read own resume files" ON storage.objects;

-- Create RLS policies for storage.objects so workers can manage their own files.
CREATE POLICY "Workers upload own resume files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE (p.id = auth.uid() OR p.auth_user_id = auth.uid())
        AND p.role = 'worker'::public.user_role
    )
  );

CREATE POLICY "Workers update own resume files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'resumes'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'resumes'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Workers delete own resume files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resumes'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Workers read own resume files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
