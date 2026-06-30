-- Worker profile avatars (public bucket with worker-owned writes)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-avatars',
  'profile-avatars',
  TRUE,
  2097152,
  ARRAY['image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS policies: only workers can write their own avatar objects.
-- Avatars are public-read via the public bucket.
DROP POLICY IF EXISTS "Workers upload own avatar files" ON storage.objects;
DROP POLICY IF EXISTS "Workers update own avatar files" ON storage.objects;
DROP POLICY IF EXISTS "Workers delete own avatar files" ON storage.objects;

CREATE POLICY "Workers upload own avatar files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'worker'::public.user_role
    )
  );

CREATE POLICY "Workers update own avatar files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'worker'::public.user_role
    )
  )
  WITH CHECK (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'worker'::public.user_role
    )
  );

CREATE POLICY "Workers delete own avatar files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'worker'::public.user_role
    )
  );

