-- Soft-archive for compliance: hide from inbox without erasing Trust & Safety alert trails (RA 10173 / GDPR).

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

COMMENT ON COLUMN public.notifications.archived_at IS
  'Soft-archive timestamp. NULL = visible in inbox. Set on dismiss; never hard-delete for audit retention.';

CREATE INDEX IF NOT EXISTS idx_notifications_user_active_created
  ON public.notifications (user_id, created_at DESC)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_user_archived_created
  ON public.notifications (user_id, created_at DESC)
  WHERE archived_at IS NOT NULL;

DROP INDEX IF EXISTS idx_notifications_user_unread_created;
CREATE INDEX idx_notifications_user_unread_created
  ON public.notifications (user_id, is_read, created_at DESC)
  WHERE is_read = false AND archived_at IS NULL;
