-- Harden admin profile UPDATE policies: require WITH CHECK (Postgres RLS).
-- Without WITH CHECK, UPDATE policies only gate row visibility via USING;
-- WITH CHECK ensures admins cannot write rows that fail the admin predicate.

DROP POLICY IF EXISTS "Admins update profiles" ON public.profiles;

CREATE POLICY "Admins update profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
