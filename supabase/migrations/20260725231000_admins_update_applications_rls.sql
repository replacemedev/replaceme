-- Ensure admins can UPDATE applications (idempotent).
-- UPDATE also requires a matching SELECT policy (already present: "Admins read all applications").

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'applications'
      AND policyname = 'Admins update applications'
  ) THEN
    CREATE POLICY "Admins update applications"
      ON public.applications
      FOR UPDATE
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;
