-- Raise profile-avatar limit to 5MB and add company-logos bucket (employer logos)

UPDATE storage.buckets
SET file_size_limit = 5242880
WHERE id = 'profile-avatars';

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  TRUE,
  5242880,
  ARRAY['image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Resilient worker avatar RLS (supports profiles linked via auth_user_id)
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
      WHERE (p.id = auth.uid() OR p.auth_user_id = auth.uid())
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
      WHERE (p.id = auth.uid() OR p.auth_user_id = auth.uid())
        AND p.role = 'worker'::public.user_role
    )
  )
  WITH CHECK (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE (p.id = auth.uid() OR p.auth_user_id = auth.uid())
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
      WHERE (p.id = auth.uid() OR p.auth_user_id = auth.uid())
        AND p.role = 'worker'::public.user_role
    )
  );

-- Employer company logo writes (folder = auth uid = employer_id)
DROP POLICY IF EXISTS "Employers upload own company logos" ON storage.objects;
DROP POLICY IF EXISTS "Employers update own company logos" ON storage.objects;
DROP POLICY IF EXISTS "Employers delete own company logos" ON storage.objects;

CREATE POLICY "Employers upload own company logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'company-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE (p.id = auth.uid() OR p.auth_user_id = auth.uid())
        AND p.role = 'employer'::public.user_role
    )
  );

CREATE POLICY "Employers update own company logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'company-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE (p.id = auth.uid() OR p.auth_user_id = auth.uid())
        AND p.role = 'employer'::public.user_role
    )
  )
  WITH CHECK (
    bucket_id = 'company-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE (p.id = auth.uid() OR p.auth_user_id = auth.uid())
        AND p.role = 'employer'::public.user_role
    )
  );

CREATE POLICY "Employers delete own company logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'company-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE (p.id = auth.uid() OR p.auth_user_id = auth.uid())
        AND p.role = 'employer'::public.user_role
    )
  );
