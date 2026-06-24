-- Worker verification status enum + documents table + private storage bucket.

DO $$ BEGIN
  CREATE TYPE public.verification_status AS ENUM (
    'unverified',
    'personal_complete',
    'documents_submitted',
    'under_review',
    'approved',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS verification_status public.verification_status
    NOT NULL DEFAULT 'unverified'::public.verification_status,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.profiles.verification_status IS 'Worker identity verification lifecycle status';
COMMENT ON COLUMN public.profiles.is_verified IS 'True when verification_status = approved';

CREATE TABLE IF NOT EXISTS public.verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('id_front', 'id_back', 'selfie')),
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL CHECK (file_size_bytes > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT verification_documents_worker_type_unique UNIQUE (worker_id, document_type)
);

CREATE INDEX IF NOT EXISTS verification_documents_worker_id_idx
  ON public.verification_documents(worker_id);

ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workers can view own verification documents" ON public.verification_documents;
DROP POLICY IF EXISTS "Workers can insert own verification documents" ON public.verification_documents;
DROP POLICY IF EXISTS "Workers can update own verification documents" ON public.verification_documents;
DROP POLICY IF EXISTS "Workers can delete own verification documents" ON public.verification_documents;

CREATE POLICY "Workers can view own verification documents"
  ON public.verification_documents FOR SELECT
  USING (worker_id = auth.uid());

CREATE POLICY "Workers can insert own verification documents"
  ON public.verification_documents FOR INSERT
  WITH CHECK (worker_id = auth.uid());

CREATE POLICY "Workers can update own verification documents"
  ON public.verification_documents FOR UPDATE
  USING (worker_id = auth.uid())
  WITH CHECK (worker_id = auth.uid());

CREATE POLICY "Workers can delete own verification documents"
  ON public.verification_documents FOR DELETE
  USING (worker_id = auth.uid());

-- Semantic view for employer talent queries.
CREATE OR REPLACE VIEW public.worker_profiles AS
SELECT
  id AS worker_id,
  id AS profile_id,
  first_name,
  last_name,
  full_name,
  professional_title,
  avatar_url,
  email,
  skills,
  experience_years,
  hourly_rate,
  verification_status,
  is_verified,
  created_at,
  updated_at
FROM public.profiles
WHERE role = 'worker'::public.user_role;

COMMENT ON VIEW public.worker_profiles IS 'Worker-facing profile projection including verification trust signals';

CREATE OR REPLACE FUNCTION public.sync_profile_is_verified()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.is_verified := (NEW.verification_status = 'approved'::public.verification_status);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_sync_is_verified ON public.profiles;
CREATE TRIGGER profiles_sync_is_verified
  BEFORE INSERT OR UPDATE OF verification_status ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_is_verified();

-- Private storage bucket for sensitive ID documents.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents',
  FALSE,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Workers upload own verification files" ON storage.objects;
DROP POLICY IF EXISTS "Workers read own verification files" ON storage.objects;
DROP POLICY IF EXISTS "Workers update own verification files" ON storage.objects;
DROP POLICY IF EXISTS "Workers delete own verification files" ON storage.objects;

CREATE POLICY "Workers upload own verification files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'verification-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Workers read own verification files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Workers update own verification files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'verification-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'verification-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Workers delete own verification files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'verification-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
