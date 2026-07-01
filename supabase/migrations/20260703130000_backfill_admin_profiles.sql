-- Backfill admin_profiles for legacy admin accounts created before admin_profiles provisioning.

INSERT INTO public.admin_profiles (user_id, admin_role, display_name)
SELECT
  p.id,
  'superadmin'::public.admin_role,
  NULLIF(TRIM(CONCAT_WS(' ', p.first_name, p.last_name)), '')
FROM public.profiles p
WHERE p.role = 'admin'
  AND NOT EXISTS (
    SELECT 1
    FROM public.admin_profiles ap
    WHERE ap.user_id = p.id
  );
