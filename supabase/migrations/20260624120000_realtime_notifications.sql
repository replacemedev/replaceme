-- Real-time notifications: schema extensions, secure inserts, triggers, Realtime publication

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS action_url TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.notifications.action_url IS 'Deep link for the notification CTA';
COMMENT ON COLUMN public.notifications.metadata IS 'Structured payload (entity ids, role context, etc.)';

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON public.notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread_created
  ON public.notifications (user_id, is_read, created_at DESC)
  WHERE is_read = false;

-- Secure notification creation (no direct client INSERT)
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id is required';
  END IF;

  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    action_url,
    metadata
  )
  VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_action_url,
    COALESCE(p_metadata, '{}'::jsonb)
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_notification(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_notification(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) TO service_role;

CREATE OR REPLACE FUNCTION public.get_admin_user_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM auth.users
  WHERE coalesce(raw_app_meta_data ->> 'role', '') = 'admin';
$$;

REVOKE ALL ON FUNCTION public.get_admin_user_ids() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_user_ids() TO service_role;

CREATE OR REPLACE FUNCTION public.notify_admins(
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_id UUID;
BEGIN
  FOR admin_id IN SELECT public.get_admin_user_ids()
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

REVOKE ALL ON FUNCTION public.notify_admins(TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.notify_admins(TEXT, TEXT, TEXT, TEXT, JSONB) TO service_role;

-- Tighten RLS: users read/update/delete own rows only; inserts via SECURITY DEFINER only
DROP POLICY IF EXISTS "Authenticated users or system can insert notifications" ON public.notifications;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Cross-domain notification triggers
CREATE OR REPLACE FUNCTION public.trg_notify_employer_new_applicant()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_employer_id UUID;
  v_job_title TEXT;
  v_worker_name TEXT;
BEGIN
  SELECT j.employer_id, j.title
  INTO v_employer_id, v_job_title
  FROM public.jobs j
  WHERE j.id = NEW.job_id;

  SELECT coalesce(nullif(trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')), ''), p.email, 'A worker')
  INTO v_worker_name
  FROM public.profiles p
  WHERE p.id = NEW.candidate_id;

  IF v_employer_id IS NOT NULL THEN
    PERFORM public.create_notification(
      v_employer_id,
      'new_applicant',
      'New applicant',
      v_worker_name || ' applied to "' || coalesce(v_job_title, 'your job') || '".',
      '/employer/jobs/' || NEW.job_id::text || '/applicants',
      jsonb_build_object('job_id', NEW.job_id, 'application_id', NEW.id, 'candidate_id', NEW.candidate_id)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS applications_notify_employer_insert ON public.applications;
CREATE TRIGGER applications_notify_employer_insert
  AFTER INSERT ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_employer_new_applicant();

CREATE OR REPLACE FUNCTION public.trg_notify_worker_application_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job_title TEXT;
  v_status TEXT;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  SELECT title INTO v_job_title FROM public.jobs WHERE id = NEW.job_id;
  v_status := NEW.status::text;

  PERFORM public.create_notification(
    NEW.candidate_id,
    'application_status',
    'Application update',
    'Your application for "' || coalesce(v_job_title, 'a job') || '" is now ' || replace(lower(v_status), '_', ' ') || '.',
    '/worker/applications',
    jsonb_build_object('job_id', NEW.job_id, 'application_id', NEW.id, 'status', v_status)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS applications_notify_worker_status ON public.applications;
CREATE TRIGGER applications_notify_worker_status
  AFTER UPDATE OF status ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_worker_application_status();

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
      jsonb_build_object('worker_id', NEW.id)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_notify_admins_verification ON public.profiles;
CREATE TRIGGER profiles_notify_admins_verification
  AFTER UPDATE OF verification_status ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_admins_verification_queue();

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
      jsonb_build_object('job_id', NEW.id)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS jobs_notify_admins_pending ON public.jobs;
CREATE TRIGGER jobs_notify_admins_pending
  AFTER INSERT OR UPDATE OF status ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_admins_pending_job();

-- Supabase Realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
