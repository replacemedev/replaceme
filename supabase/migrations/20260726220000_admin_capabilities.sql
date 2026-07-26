-- Admin module capabilities + invite lifecycle (RBAC v1)
-- Superadmins ignore capabilities (full access). Moderators are scoped via text[].

ALTER TABLE public.admin_profiles
  ADD COLUMN IF NOT EXISTS capabilities text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS invited_at timestamptz,
  ADD COLUMN IF NOT EXISTS invite_accepted_at timestamptz;

COMMENT ON COLUMN public.admin_profiles.capabilities IS
  'Module keys granted to moderators. Superadmins ignore this list (full access).';
COMMENT ON COLUMN public.admin_profiles.invited_at IS
  'When the invite email was last sent. NULL for legacy password-created admins.';
COMMENT ON COLUMN public.admin_profiles.invite_accepted_at IS
  'When the invitee set a password / first accepted access.';

-- Backfill existing moderators with Trust & Safety need-to-know defaults.
UPDATE public.admin_profiles
SET capabilities = ARRAY[
  'dashboard',
  'identity',
  'reports',
  'moderation',
  'disputes',
  'notifications',
  'settings'
]::text[]
WHERE admin_role = 'moderator'
  AND (capabilities IS NULL OR cardinality(capabilities) = 0);

-- Superadmins keep empty array (ignored at app layer); mark accepted if unset.
UPDATE public.admin_profiles
SET invite_accepted_at = COALESCE(invite_accepted_at, created_at)
WHERE invite_accepted_at IS NULL;

CREATE OR REPLACE FUNCTION public.has_admin_capability(cap text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_profiles ap
    WHERE ap.user_id = auth.uid()
      AND (
        ap.admin_role = 'superadmin'
        OR cap = ANY (ap.capabilities)
      )
  );
$$;

REVOKE ALL ON FUNCTION public.has_admin_capability(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_admin_capability(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_admin_capability(text) TO service_role;
