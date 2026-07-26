-- SOC2 / GDPR / RA 10173: append-only audit_logs with durable actor snapshots.
-- Preserves rows when auth users are deleted; blocks UPDATE/DELETE for all roles.

-- 1) Durable actor identity (survives profile deletion)
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS actor_email TEXT,
  ADD COLUMN IF NOT EXISTS actor_display_name TEXT,
  ADD COLUMN IF NOT EXISTS actor_type TEXT NOT NULL DEFAULT 'system';

COMMENT ON COLUMN public.audit_logs.actor_email IS
  'Denormalized actor email at insert time; survives auth user deletion';
COMMENT ON COLUMN public.audit_logs.actor_display_name IS
  'Denormalized actor display name at insert time';
COMMENT ON COLUMN public.audit_logs.actor_type IS
  'admin | worker | system — actor category at insert time';

ALTER TABLE public.audit_logs
  DROP CONSTRAINT IF EXISTS audit_logs_actor_type_check;

ALTER TABLE public.audit_logs
  ADD CONSTRAINT audit_logs_actor_type_check
  CHECK (actor_type IN ('admin', 'worker', 'system'));

-- 2) Preserve audit rows when auth users are removed (was ON DELETE CASCADE)
ALTER TABLE public.audit_logs
  DROP CONSTRAINT IF EXISTS audit_logs_admin_id_fkey;

ALTER TABLE public.audit_logs
  ADD CONSTRAINT audit_logs_admin_id_fkey
  FOREIGN KEY (admin_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3) Backfill actor snapshots from live profiles / admin_profiles
UPDATE public.audit_logs al
SET
  actor_email = COALESCE(al.actor_email, p.email),
  actor_display_name = COALESCE(
    al.actor_display_name,
    NULLIF(TRIM(ap.display_name), ''),
    NULLIF(TRIM(CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, ''))), ''),
    p.email
  ),
  actor_type = CASE
    WHEN al.admin_id IS NOT NULL THEN 'admin'
    WHEN al.actor_type IS NOT NULL AND al.actor_type <> 'system' THEN al.actor_type
    WHEN al.target_type IN ('worker', 'profile', 'user')
      AND (al.metadata ? 'actor_id') THEN 'worker'
    ELSE COALESCE(NULLIF(al.actor_type, ''), 'system')
  END
FROM public.profiles p
LEFT JOIN public.admin_profiles ap ON ap.user_id = p.id
WHERE al.admin_id = p.id
  AND (
    al.actor_email IS NULL
    OR al.actor_display_name IS NULL
    OR al.actor_type = 'system'
  );

UPDATE public.audit_logs
SET actor_type = 'worker'
WHERE admin_id IS NULL
  AND actor_type = 'system'
  AND (
    action_type LIKE 'worker.%'
    OR (metadata ? 'actor_id')
  );

-- 4) Immutability: block UPDATE/DELETE even for service_role
CREATE OR REPLACE FUNCTION public.prevent_audit_log_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs are immutable; % is not permitted', TG_OP;
END;
$$;

DROP TRIGGER IF EXISTS audit_logs_immutable ON public.audit_logs;
CREATE TRIGGER audit_logs_immutable
  BEFORE UPDATE OR DELETE ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_audit_log_mutation();

-- 5) Defense in depth: revoke UPDATE/DELETE from API roles (RLS still gates SELECT/INSERT)
REVOKE UPDATE, DELETE ON TABLE public.audit_logs FROM PUBLIC;
REVOKE UPDATE, DELETE ON TABLE public.audit_logs FROM anon, authenticated;
