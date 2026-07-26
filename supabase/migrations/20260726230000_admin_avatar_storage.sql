-- Allow admin role to manage own objects in profile-avatars (mirrors worker policies).
-- Service-role uploads already bypass RLS; this enables future user-client paths.

DROP POLICY IF EXISTS "Admins upload own avatar files" ON storage.objects;
DROP POLICY IF EXISTS "Admins update own avatar files" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete own avatar files" ON storage.objects;

CREATE POLICY "Admins upload own avatar files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'::public.user_role
    )
  );

CREATE POLICY "Admins update own avatar files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'::public.user_role
    )
  )
  WITH CHECK (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'::public.user_role
    )
  );

CREATE POLICY "Admins delete own avatar files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'::public.user_role
    )
  );
