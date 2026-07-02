-- Email logging tables for Resend + application notifications
-- Stores message sends (transactional + broadcast) and webhook-delivered events.

-- =============================================================================
-- email_messages
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.email_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  provider TEXT NOT NULL DEFAULT 'resend',
  provider_message_id TEXT,
  provider_broadcast_id TEXT,

  kind TEXT NOT NULL CHECK (kind IN ('transactional', 'broadcast')),
  template_key TEXT,

  to_email TEXT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  role public.user_role,

  -- App-facing tier label for filtering in the admin dashboard.
  -- We store the display label (Discovery/Starter/Growth/Scale) to match product language,
  -- and optionally also store the raw plan slug on sends.
  tier_label TEXT CHECK (tier_label IN ('Discovery', 'Starter', 'Growth', 'Scale')),
  tier_slug TEXT CHECK (tier_slug IN ('discovery', 'starter', 'growth', 'scale')),

  subject TEXT,
  tags JSONB NOT NULL DEFAULT '{}'::jsonb,

  status TEXT NOT NULL DEFAULT 'queued',
  last_event_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_email_messages_created_at
  ON public.email_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_messages_provider_message_id
  ON public.email_messages (provider, provider_message_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_user_id_created
  ON public.email_messages (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_messages_role_created
  ON public.email_messages (role, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_messages_tier_created
  ON public.email_messages (tier_slug, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_messages_status_created
  ON public.email_messages (status, created_at DESC);

ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read email messages" ON public.email_messages;
CREATE POLICY "Admins read email messages"
  ON public.email_messages FOR SELECT
  USING (
    public.is_admin()
  );

-- =============================================================================
-- email_events
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.email_messages(id) ON DELETE CASCADE,

  provider TEXT NOT NULL DEFAULT 'resend',
  provider_message_id TEXT,
  provider_broadcast_id TEXT,

  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_email_events_message_occurred
  ON public.email_events (message_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_events_provider_message_id
  ON public.email_events (provider, provider_message_id);
CREATE INDEX IF NOT EXISTS idx_email_events_event_type_occurred
  ON public.email_events (event_type, occurred_at DESC);

ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read email events" ON public.email_events;
CREATE POLICY "Admins read email events"
  ON public.email_events FOR SELECT
  USING (
    public.is_admin()
  );

-- =============================================================================
-- updated_at trigger
-- =============================================================================
DROP TRIGGER IF EXISTS email_messages_updated_at ON public.email_messages;
CREATE TRIGGER email_messages_updated_at
  BEFORE UPDATE ON public.email_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

