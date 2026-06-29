-- Cookie consent preferences (current state) + audit events (GDPR/CCPA evidence)

CREATE TABLE IF NOT EXISTS public.cookie_consent_preferences (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  consent_necessary BOOLEAN NOT NULL DEFAULT true,
  consent_analytics BOOLEAN NOT NULL DEFAULT false,
  consent_marketing BOOLEAN NOT NULL DEFAULT false,
  policy_version TEXT NOT NULL,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT cookie_consent_necessary_always_true CHECK (consent_necessary = true)
);

CREATE TABLE IF NOT EXISTS public.cookie_consent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  anonymous_id TEXT,
  consent_necessary BOOLEAN NOT NULL,
  consent_analytics BOOLEAN NOT NULL,
  consent_marketing BOOLEAN NOT NULL,
  policy_version TEXT NOT NULL,
  action TEXT NOT NULL CHECK (
    action IN (
      'accept_all',
      'reject_non_essential',
      'save_preferences',
      'withdraw'
    )
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_cookie_consent_events_profile_id
  ON public.cookie_consent_events (profile_id);
CREATE INDEX IF NOT EXISTS idx_cookie_consent_events_anonymous_id
  ON public.cookie_consent_events (anonymous_id);
CREATE INDEX IF NOT EXISTS idx_cookie_consent_events_created_at
  ON public.cookie_consent_events (created_at DESC);

ALTER TABLE public.cookie_consent_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cookie_consent_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users manage own cookie consent preferences'
      AND tablename = 'cookie_consent_preferences'
  ) THEN
    CREATE POLICY "Users manage own cookie consent preferences"
      ON public.cookie_consent_preferences
      FOR ALL
      USING (auth.uid() = profile_id)
      WITH CHECK (auth.uid() = profile_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users insert own cookie consent events'
      AND tablename = 'cookie_consent_events'
  ) THEN
    CREATE POLICY "Users insert own cookie consent events"
      ON public.cookie_consent_events
      FOR INSERT
      WITH CHECK (profile_id IS NULL OR auth.uid() = profile_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Admins read cookie consent events'
      AND tablename = 'cookie_consent_events'
  ) THEN
    CREATE POLICY "Admins read cookie consent events"
      ON public.cookie_consent_events
      FOR SELECT
      USING (public.is_admin());
  END IF;
END $$;

-- Allow anonymous/guest audit inserts via service role only (server actions use user client with null profile_id)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Guests insert cookie consent events'
      AND tablename = 'cookie_consent_events'
  ) THEN
    CREATE POLICY "Guests insert cookie consent events"
      ON public.cookie_consent_events
      FOR INSERT
      WITH CHECK (profile_id IS NULL AND anonymous_id IS NOT NULL);
  END IF;
END $$;

COMMENT ON TABLE public.cookie_consent_preferences IS 'Latest cookie consent choice per authenticated profile';
COMMENT ON TABLE public.cookie_consent_events IS 'Append-only cookie consent audit log';

-- CMS seed for cookie policy (admin-editable; empty body uses built-in fallback)
INSERT INTO public.page_content (slug, title, content_type, body, meta, is_published)
VALUES (
  'cookie-policy',
  'Cookie Policy',
  'html',
  NULL,
  jsonb_build_object(
    'lastUpdated', 'June 29, 2026',
    'badge', 'Legal',
    'badgeVariant', 'pill'
  ),
  true
)
ON CONFLICT (slug) DO NOTHING;
