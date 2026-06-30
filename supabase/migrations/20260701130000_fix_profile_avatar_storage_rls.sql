-- Fix profile-avatar and company-logo storage RLS.
-- Inline EXISTS (SELECT FROM profiles) fails under profiles RLS during storage upserts.
-- SECURITY DEFINER helpers bypass that visibility gap; SELECT policies enable list/remove.

CREATE OR REPLACE FUNCTION public.auth_user_is_worker()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE (p.id = auth.uid() OR p.auth_user_id = auth.uid())
      AND p.role = 'worker'::public.user_role
  );
$$;

CREATE OR REPLACE FUNCTION public.auth_user_is_employer()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE (p.id = auth.uid() OR p.auth_user_id = auth.uid())
      AND p.role = 'employer'::public.user_role
  );
$$;

GRANT EXECUTE ON FUNCTION public.auth_user_is_worker() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.auth_user_is_employer() TO authenticated, service_role;

-- Worker avatars
DROP POLICY IF EXISTS "Workers upload own avatar files" ON storage.objects;
DROP POLICY IF EXISTS "Workers update own avatar files" ON storage.objects;
DROP POLICY IF EXISTS "Workers delete own avatar files" ON storage.objects;
DROP POLICY IF EXISTS "Workers read own avatar files" ON storage.objects;

CREATE POLICY "Workers read own avatar files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND public.auth_user_is_worker()
  );

CREATE POLICY "Workers upload own avatar files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND public.auth_user_is_worker()
  );

CREATE POLICY "Workers update own avatar files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND public.auth_user_is_worker()
  )
  WITH CHECK (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND public.auth_user_is_worker()
  );

CREATE POLICY "Workers delete own avatar files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND public.auth_user_is_worker()
  );

-- Employer logos
DROP POLICY IF EXISTS "Employers upload own company logos" ON storage.objects;
DROP POLICY IF EXISTS "Employers update own company logos" ON storage.objects;
DROP POLICY IF EXISTS "Employers delete own company logos" ON storage.objects;
DROP POLICY IF EXISTS "Employers read own company logos" ON storage.objects;

CREATE POLICY "Employers read own company logos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'company-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND public.auth_user_is_employer()
  );

CREATE POLICY "Employers upload own company logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'company-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND public.auth_user_is_employer()
  );

CREATE POLICY "Employers update own company logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'company-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND public.auth_user_is_employer()
  )
  WITH CHECK (
    bucket_id = 'company-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND public.auth_user_is_employer()
  );

CREATE POLICY "Employers delete own company logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'company-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND public.auth_user_is_employer()
  );
