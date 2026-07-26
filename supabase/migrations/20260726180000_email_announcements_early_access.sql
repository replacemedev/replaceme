-- Email template toggles + in-app product announcements (Scale early access).
-- Also adds entitlement_denial_type for early_access gating.

ALTER TYPE public.entitlement_denial_type ADD VALUE IF NOT EXISTS 'early_access';

-- =============================================================================
-- email_template_settings
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.email_template_settings (
  template_key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.email_template_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage email template settings" ON public.email_template_settings;
CREATE POLICY "Admins manage email template settings"
  ON public.email_template_settings
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================================================
-- product_announcements
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.product_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  feature_key TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT NULL,
  cta_label TEXT NULL,
  cta_href TEXT NULL,

  teaser_title TEXT NULL,
  teaser_summary TEXT NULL,

  audience TEXT NOT NULL DEFAULT 'employer'
    CHECK (audience IN ('employer')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  requires_early_access BOOLEAN NOT NULL DEFAULT true,

  starts_at TIMESTAMPTZ NULL,
  ends_at TIMESTAMPTZ NULL,
  created_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,

  CONSTRAINT product_announcements_feature_key_nonempty CHECK (char_length(trim(feature_key)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS product_announcements_feature_key_uidx
  ON public.product_announcements (feature_key)
  WHERE status <> 'archived';

CREATE INDEX IF NOT EXISTS product_announcements_status_window_idx
  ON public.product_announcements (status, enabled, starts_at, ends_at DESC);

ALTER TABLE public.product_announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage product announcements" ON public.product_announcements;
CREATE POLICY "Admins manage product announcements"
  ON public.product_announcements
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Employers read published announcements" ON public.product_announcements;
CREATE POLICY "Employers read published announcements"
  ON public.product_announcements
  FOR SELECT
  USING (
    status = 'published'
    AND (starts_at IS NULL OR starts_at <= timezone('utc'::text, now()))
    AND (ends_at IS NULL OR ends_at >= timezone('utc'::text, now()))
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'employer'
    )
  );

DROP TRIGGER IF EXISTS product_announcements_updated_at ON public.product_announcements;
CREATE TRIGGER product_announcements_updated_at
  BEFORE UPDATE ON public.product_announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- announcement_dismissals
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.announcement_dismissals (
  announcement_id UUID NOT NULL REFERENCES public.product_announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dismissed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (announcement_id, user_id)
);

CREATE INDEX IF NOT EXISTS announcement_dismissals_user_id_idx
  ON public.announcement_dismissals (user_id);

ALTER TABLE public.announcement_dismissals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own announcement dismissals" ON public.announcement_dismissals;
CREATE POLICY "Users manage own announcement dismissals"
  ON public.announcement_dismissals
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read announcement dismissals" ON public.announcement_dismissals;
CREATE POLICY "Admins read announcement dismissals"
  ON public.announcement_dismissals
  FOR SELECT
  USING (public.is_admin());
