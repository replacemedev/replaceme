-- Harden admin jobs UPDATE policy: require WITH CHECK (Postgres RLS).
-- Without WITH CHECK, UPDATE only gates row visibility via USING;
-- WITH CHECK ensures admins cannot write rows that fail the admin predicate.
-- Matches 20260725232000_admins_update_profiles_with_check.sql pattern.

DROP POLICY IF EXISTS "Admins update jobs" ON public.jobs;

CREATE POLICY "Admins update jobs"
  ON public.jobs
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
