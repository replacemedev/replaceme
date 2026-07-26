-- Need-to-know admin notifications: fan-out only to superadmins + mods with the required capability.

DROP FUNCTION IF EXISTS public.notify_admins(TEXT, TEXT, TEXT, TEXT, JSONB);

CREATE OR REPLACE FUNCTION public.notify_admins(
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_required_capability TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_id UUID;
BEGIN
  FOR admin_id IN
    SELECT u.id
    FROM auth.users u
    LEFT JOIN public.admin_profiles ap ON ap.user_id = u.id
    WHERE coalesce(u.raw_app_meta_data ->> 'role', '') = 'admin'
      AND (
        p_required_capability IS NULL
        OR coalesce(ap.admin_role, 'moderator') = 'superadmin'
        OR (
          ap.capabilities IS NOT NULL
          AND p_required_capability = ANY (ap.capabilities)
        )
      )
  LOOP
    PERFORM public.create_notification(
      admin_id,
      p_type,
      p_title,
      p_message,
      p_action_url,
      p_metadata
    );
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_admins(TEXT, TEXT, TEXT, TEXT, JSONB, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.notify_admins(TEXT, TEXT, TEXT, TEXT, JSONB, TEXT) TO service_role;

-- Verification queue → identity capability
CREATE OR REPLACE FUNCTION public.trg_notify_admins_verification_queue()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name TEXT;
BEGIN
  IF NEW.role <> 'worker'::public.user_role THEN
    RETURN NEW;
  END IF;

  IF NEW.verification_status = 'documents_submitted'::public.verification_status
     AND (OLD.verification_status IS DISTINCT FROM NEW.verification_status) THEN
    SELECT coalesce(nullif(trim(coalesce(NEW.first_name, '') || ' ' || coalesce(NEW.last_name, '')), ''), NEW.email, 'A worker')
    INTO v_name;

    PERFORM public.notify_admins(
      'identity_verification_request',
      'Identity verification pending',
      v_name || ' submitted documents for review.',
      '/admin/identity',
      jsonb_build_object('worker_id', NEW.id),
      'identity'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Pending job → jobs capability
CREATE OR REPLACE FUNCTION public.trg_notify_admins_pending_job()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'Pending Review'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    PERFORM public.notify_admins(
      'moderation_queue',
      'Job pending review',
      '"' || NEW.title || '" requires moderation.',
      '/admin/jobs',
      jsonb_build_object('job_id', NEW.id),
      'jobs'
    );
  END IF;

  RETURN NEW;
END;
$$;
