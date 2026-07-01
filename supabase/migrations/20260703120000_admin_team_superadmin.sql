-- Admin team management: superadmin helper + tighten admin_profiles mutations

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_profiles ap
    WHERE ap.user_id = auth.uid()
      AND ap.admin_role = 'superadmin'
  );
$$;

DROP POLICY IF EXISTS "Admins manage admin profiles" ON public.admin_profiles;

CREATE POLICY "Superadmins manage admin profiles" ON public.admin_profiles
  FOR ALL
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());
