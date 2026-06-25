-- Phase 4: Supabase advisor WARN remediation
-- - SET search_path on mutable functions
-- - REVOKE RPC EXECUTE on internal / trigger SECURITY DEFINER functions
-- - Tighten chat_messages UPDATE RLS WITH CHECK
-- - Drop orphaned legacy functions (no triggers, mock seeder)

-- =============================================================================
-- DROP ORPHANED FUNCTIONS (no attached triggers; legacy / mock)
-- =============================================================================
DROP FUNCTION IF EXISTS public.insert_employer_compat();
DROP FUNCTION IF EXISTS public.update_employer_compat();
DROP FUNCTION IF EXISTS public.delete_employer_compat();
DROP FUNCTION IF EXISTS public.sync_participant_ids();
DROP FUNCTION IF EXISTS public.seed_worker_dashboard_data(UUID);

-- =============================================================================
-- search_path fixes
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_chat_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.chat_threads
  SET updated_at = timezone('utc'::text, now())
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_profile_is_verified()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.is_verified := (NEW.verification_status = 'approved'::public.verification_status);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.guard_employer_subscription_client_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF coalesce(auth.jwt() ->> 'role', '') = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    RAISE EXCEPTION 'employer_subscriptions inserts require service role';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status
      OR NEW.plan_id IS DISTINCT FROM OLD.plan_id
      OR NEW.current_period_end IS DISTINCT FROM OLD.current_period_end
      OR NEW.stripe_subscription_id IS DISTINCT FROM OLD.stripe_subscription_id
    THEN
      RAISE EXCEPTION 'subscription billing fields require service role';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- is_admin only reads auth.jwt(); INVOKER avoids definer RPC escalation warnings
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- =============================================================================
-- chat_messages UPDATE — mirror USING in WITH CHECK (no permissive true)
-- =============================================================================
DROP POLICY IF EXISTS "Users can update messages in their threads" ON public.chat_messages;

CREATE POLICY "Users can update messages in their threads" ON public.chat_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_threads t
      WHERE t.id = thread_id
      AND (
        t.worker_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.company_profiles cp
          WHERE cp.id = t.company_profile_id
          AND cp.employer_id = auth.uid()
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_threads t
      WHERE t.id = thread_id
      AND (
        t.worker_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.company_profiles cp
          WHERE cp.id = t.company_profile_id
          AND cp.employer_id = auth.uid()
        )
      )
    )
  );

-- =============================================================================
-- RPC lockdown — revoke anon/authenticated on internal SECURITY DEFINER functions
-- =============================================================================
DO $$
DECLARE
  fn RECORD;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND p.proname IN (
        'create_notification',
        'get_admin_user_ids',
        'notify_admins',
        'handle_new_user',
        'handle_new_chat_message',
        'trg_notify_employer_new_applicant',
        'trg_notify_worker_application_status',
        'trg_notify_admins_verification_queue',
        'trg_notify_admins_pending_job',
        'increment_job_views',
        'increment_job_clicks'
      )
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', fn.sig);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', fn.sig);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM authenticated', fn.sig);
  END LOOP;
END $$;

-- Service-role only RPCs (server actions / triggers)
GRANT EXECUTE ON FUNCTION public.create_notification(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_admin_user_ids() TO service_role;
GRANT EXECUTE ON FUNCTION public.notify_admins(TEXT, TEXT, TEXT, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_job_views(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_job_clicks(UUID) TO service_role;
