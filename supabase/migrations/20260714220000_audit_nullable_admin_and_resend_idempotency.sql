-- Audit logs: allow non-admin actors (worker/auth) via service role;
-- make admin_id nullable so worker/security events can be stored.

ALTER TABLE public.audit_logs
  ALTER COLUMN admin_id DROP NOT NULL;

COMMENT ON COLUMN public.audit_logs.admin_id IS
  'Admin actor when present; NULL for worker/security/system events written via service role.';

-- Resend webhook idempotency (svix-id claim table), mirrors stripe_webhook_events.
CREATE TABLE IF NOT EXISTS public.resend_webhook_events (
  svix_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_resend_webhook_events_processed_at
  ON public.resend_webhook_events (processed_at DESC);

ALTER TABLE public.resend_webhook_events ENABLE ROW LEVEL SECURITY;

-- No end-user policies: service_role only (bypass RLS). Explicit deny for anon/authenticated.
DROP POLICY IF EXISTS "No direct access resend_webhook_events" ON public.resend_webhook_events;
