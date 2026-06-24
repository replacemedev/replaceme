-- Phase 3: Admin moderation schema — account status, audit logs, extended RLS

DO $$ BEGIN
  CREATE TYPE public.account_status AS ENUM ('active', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_status public.account_status
    NOT NULL DEFAULT 'active'::public.account_status;

COMMENT ON COLUMN public.profiles.account_status IS 'Platform account standing; suspended users are blocked at auth';

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.audit_logs (admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON public.audit_logs (action_type);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles (account_status);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Admins read audit logs' AND tablename = 'audit_logs'
  ) THEN
    CREATE POLICY "Admins read audit logs" ON public.audit_logs
      FOR SELECT USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Admins insert audit logs' AND tablename = 'audit_logs'
  ) THEN
    CREATE POLICY "Admins insert audit logs" ON public.audit_logs
      FOR INSERT WITH CHECK (public.is_admin() AND admin_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Admins update verification documents' AND tablename = 'verification_documents'
  ) THEN
    CREATE POLICY "Admins update verification documents" ON public.verification_documents
      FOR UPDATE USING (public.is_admin());
  END IF;
END $$;

-- Allow admins to read verification files in private bucket
DROP POLICY IF EXISTS "Admins read verification files" ON storage.objects;
CREATE POLICY "Admins read verification files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification-documents'
    AND public.is_admin()
  );
