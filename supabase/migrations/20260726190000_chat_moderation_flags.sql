-- Trust & Safety messaging flags: justified-cause queue (system scan + user report).
-- Admins must not browse unflagged threads (RA 10173 / GDPR data minimisation).

CREATE TABLE IF NOT EXISTS public.chat_moderation_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  flagged_message_id UUID NULL REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  reason_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  reporter_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_report_id UUID NULL REFERENCES public.user_reports(id) ON DELETE SET NULL,
  admin_notes TEXT NULL,
  reviewed_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ NULL,
  CONSTRAINT chat_moderation_flags_source_allowed
    CHECK (source IN ('system', 'user_report')),
  CONSTRAINT chat_moderation_flags_reason_allowed
    CHECK (reason_code IN (
      'contact_info',
      'payment_circumvention',
      'harassment',
      'scam_fraud',
      'spam_misleading',
      'other'
    )),
  CONSTRAINT chat_moderation_flags_status_allowed
    CHECK (status IN ('open', 'investigating', 'dismissed', 'resolved'))
);

CREATE INDEX IF NOT EXISTS chat_moderation_flags_queue_idx
  ON public.chat_moderation_flags (status, created_at DESC)
  WHERE status IN ('open', 'investigating');

CREATE INDEX IF NOT EXISTS chat_moderation_flags_thread_id_idx
  ON public.chat_moderation_flags (thread_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS chat_moderation_flags_open_system_dedupe_idx
  ON public.chat_moderation_flags (thread_id, reason_code, flagged_message_id)
  WHERE source = 'system' AND status IN ('open', 'investigating');

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS set_chat_moderation_flags_updated_at ON public.chat_moderation_flags;
    CREATE TRIGGER set_chat_moderation_flags_updated_at
      BEFORE UPDATE ON public.chat_moderation_flags
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

ALTER TABLE public.chat_moderation_flags ENABLE ROW LEVEL SECURITY;

-- No authenticated SELECT/INSERT policies: users never read flags; service role
-- inserts system flags; user reports go through server actions with service role.
DROP POLICY IF EXISTS "chat_moderation_flags_admin_select" ON public.chat_moderation_flags;
CREATE POLICY "chat_moderation_flags_admin_select"
  ON public.chat_moderation_flags
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "chat_moderation_flags_admin_update" ON public.chat_moderation_flags;
CREATE POLICY "chat_moderation_flags_admin_update"
  ON public.chat_moderation_flags
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

COMMENT ON TABLE public.chat_moderation_flags IS
  'T&S messaging queue. Human review only when system-flagged or user-reported (RA 10173 / GDPR).';

-- Link confidential user reports to a conversation when filed from messaging.
ALTER TABLE public.user_reports
  ADD COLUMN IF NOT EXISTS thread_id UUID NULL REFERENCES public.chat_threads(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS user_reports_thread_id_idx
  ON public.user_reports (thread_id)
  WHERE thread_id IS NOT NULL;
