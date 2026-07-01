-- Fix recursive RLS on admin_profiles:
-- is_superadmin() queried admin_profiles while RLS evaluated is_superadmin() again.

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_profiles ap
    WHERE ap.user_id = auth.uid()
      AND ap.admin_role = 'superadmin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_superadmin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_superadmin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_superadmin() TO service_role;

DROP POLICY IF EXISTS "Superadmins manage admin profiles" ON public.admin_profiles;

CREATE POLICY "Superadmins insert admin profiles" ON public.admin_profiles
  FOR INSERT
  WITH CHECK (public.is_superadmin());

CREATE POLICY "Superadmins update admin profiles" ON public.admin_profiles
  FOR UPDATE
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

CREATE POLICY "Superadmins delete admin profiles" ON public.admin_profiles
  FOR DELETE
  USING (public.is_superadmin());
