-- Phase 3: Security hardening — RLS tightening, indexes, RPC lockdown, view invoker mode

-- =============================================================================
-- PERFORMANCE INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications (job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON public.applications (candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications (status);
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id_status ON public.jobs (employer_id, status);
CREATE INDEX IF NOT EXISTS idx_chat_threads_worker_id ON public.chat_threads (worker_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_company_profile_id ON public.chat_threads (company_profile_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id ON public.chat_messages (thread_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id, created_at DESC);

-- =============================================================================
-- PROFILES — remove world-readable SELECT
-- =============================================================================
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_applicants_for_employer"
  ON public.profiles FOR SELECT
  USING (
    role = 'worker'
    AND EXISTS (
      SELECT 1
      FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      WHERE a.candidate_id = profiles.id
        AND j.employer_id = auth.uid()
    )
  );

CREATE POLICY "profiles_select_messaging_counterparties"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.chat_threads ct
      JOIN public.company_profiles cp ON cp.id = ct.company_profile_id
      WHERE (
        (ct.worker_id = profiles.id AND cp.employer_id = auth.uid())
        OR (ct.worker_id = auth.uid() AND cp.employer_id = profiles.id)
      )
    )
  );

-- =============================================================================
-- COMPANY_PROFILES — scoped read instead of public
-- =============================================================================
DROP POLICY IF EXISTS "Company profiles are viewable by everyone" ON public.company_profiles;

CREATE POLICY "company_profiles_select_own"
  ON public.company_profiles FOR SELECT
  USING (employer_id = auth.uid());

CREATE POLICY "company_profiles_select_via_jobs"
  ON public.company_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.employer_id = company_profiles.employer_id
        AND j.status = 'Active'
    )
  );

CREATE POLICY "company_profiles_select_via_messaging"
  ON public.company_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_threads ct
      WHERE ct.company_profile_id = company_profiles.id
        AND ct.worker_id = auth.uid()
    )
  );

-- =============================================================================
-- LEGACY CONVERSATIONS — close permissive INSERT/UPDATE
-- =============================================================================
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can update conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can insert conversations" ON public.conversations;

CREATE POLICY "conversations_insert_authenticated"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "conversations_update_participants"
  ON public.conversations FOR UPDATE
  USING (public.is_conversation_member(id, auth.uid()))
  WITH CHECK (public.is_conversation_member(id, auth.uid()));

-- =============================================================================
-- COMPAT VIEWS — enforce invoker RLS (PostgreSQL 15+)
-- =============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'job_posts') THEN
    EXECUTE 'ALTER VIEW public.job_posts SET (security_invoker = true)';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'job_applications') THEN
    EXECUTE 'ALTER VIEW public.job_applications SET (security_invoker = true)';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'saved_jobs') THEN
    EXECUTE 'ALTER VIEW public.saved_jobs SET (security_invoker = true)';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'worker_profiles') THEN
    EXECUTE 'ALTER VIEW public.worker_profiles SET (security_invoker = true)';
  END IF;
END $$;

-- =============================================================================
-- RPC LOCKDOWN — revoke anon, restrict dangerous functions
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
      AND p.proname IN (
        'seed_worker_dashboard_data',
        'get_platform_metrics',
        'create_notification'
      )
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', fn.sig);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', fn.sig);
  END LOOP;
END $$;

-- get_platform_metrics: admin-only via is_admin() check inside function
GRANT EXECUTE ON FUNCTION public.get_platform_metrics() TO authenticated;

-- create_notification: service_role only (already set in prior migration; reinforce)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'create_notification'
  ) THEN
    REVOKE ALL ON FUNCTION public.create_notification(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
    REVOKE ALL ON FUNCTION public.create_notification(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) FROM anon;
    GRANT EXECUTE ON FUNCTION public.create_notification(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) TO service_role;
  END IF;
END $$;

-- seed_worker_dashboard_data: revoke all overloads if present
DO $$
DECLARE
  fn RECORD;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'seed_worker_dashboard_data'
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', fn.sig);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', fn.sig);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM authenticated', fn.sig);
  END LOOP;
END $$;
