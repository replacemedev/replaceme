-- Resend broadcast segmentation mapping (Supabase-side)

CREATE TABLE IF NOT EXISTS public.resend_segments (
  key TEXT PRIMARY KEY,
  segment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_resend_segments_segment_id ON public.resend_segments (segment_id);

ALTER TABLE public.resend_segments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read resend segments" ON public.resend_segments;
CREATE POLICY "Admins read resend segments"
  ON public.resend_segments FOR SELECT
  USING (public.is_admin());

-- Service-role only writes (no public insert/update/delete policies).

DROP TRIGGER IF EXISTS resend_segments_updated_at ON public.resend_segments;
CREATE TRIGGER resend_segments_updated_at
  BEFORE UPDATE ON public.resend_segments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS resend_contact_id TEXT;

