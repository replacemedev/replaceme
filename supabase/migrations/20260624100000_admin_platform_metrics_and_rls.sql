-- Admin JWT helper
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- Admin read/write policies (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins read all profiles' AND tablename = 'profiles') THEN
    CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins read all company profiles' AND tablename = 'company_profiles') THEN
    CREATE POLICY "Admins read all company profiles" ON public.company_profiles FOR SELECT USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins read all jobs' AND tablename = 'jobs') THEN
    CREATE POLICY "Admins read all jobs" ON public.jobs FOR SELECT USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins read all applications' AND tablename = 'applications') THEN
    CREATE POLICY "Admins read all applications" ON public.applications FOR SELECT USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins read all contracts' AND tablename = 'contracts') THEN
    CREATE POLICY "Admins read all contracts" ON public.contracts FOR SELECT USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins read all subscriptions' AND tablename = 'employer_subscriptions') THEN
    CREATE POLICY "Admins read all subscriptions" ON public.employer_subscriptions FOR SELECT USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins read verification documents' AND tablename = 'verification_documents') THEN
    CREATE POLICY "Admins read verification documents" ON public.verification_documents FOR SELECT USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins update profiles' AND tablename = 'profiles') THEN
    CREATE POLICY "Admins update profiles" ON public.profiles FOR UPDATE USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins update jobs' AND tablename = 'jobs') THEN
    CREATE POLICY "Admins update jobs" ON public.jobs FOR UPDATE USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins delete jobs' AND tablename = 'jobs') THEN
    CREATE POLICY "Admins delete jobs" ON public.jobs FOR DELETE USING (public.is_admin());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_role_created ON public.profiles (role, created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_status_created ON public.jobs (status, created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON public.profiles (verification_status) WHERE role = 'worker';
CREATE INDEX IF NOT EXISTS idx_employer_subscriptions_status ON public.employer_subscriptions (status);

CREATE OR REPLACE FUNCTION public.get_platform_metrics()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'total_workers', (SELECT count(*)::int FROM public.profiles WHERE role = 'worker'),
    'total_employers', (SELECT count(*)::int FROM public.company_profiles),
    'total_users', (SELECT count(*)::int FROM public.profiles WHERE role = 'worker') + (SELECT count(*)::int FROM public.company_profiles),
    'active_jobs', (SELECT count(*)::int FROM public.jobs WHERE status = 'Active'),
    'pending_jobs', (SELECT count(*)::int FROM public.jobs WHERE status = 'Pending Review'),
    'total_applications', (SELECT count(*)::int FROM public.applications),
    'active_contracts', (SELECT count(*)::int FROM public.contracts WHERE status = 'active'),
    'pending_verifications', (
      SELECT count(*)::int FROM public.profiles
      WHERE role = 'worker'
        AND verification_status IN ('documents_submitted', 'under_review')
    ),
    'verified_workers', (
      SELECT count(*)::int FROM public.profiles
      WHERE role = 'worker' AND is_verified = true
    ),
    'active_subscriptions', (
      SELECT count(*)::int FROM public.employer_subscriptions WHERE status = 'active'
    ),
    'user_growth_30d', coalesce((
      SELECT jsonb_agg(jsonb_build_object('date', d::date, 'count', c) ORDER BY d)
      FROM (
        SELECT date_trunc('day', created_at) AS d, count(*)::int AS c
        FROM public.profiles
        WHERE created_at >= now() - interval '30 days'
        GROUP BY 1
      ) sub
    ), '[]'::jsonb),
    'job_activity_30d', coalesce((
      SELECT jsonb_agg(jsonb_build_object('date', d::date, 'count', c) ORDER BY d)
      FROM (
        SELECT date_trunc('day', created_at) AS d, count(*)::int AS c
        FROM public.jobs
        WHERE created_at >= now() - interval '30 days'
        GROUP BY 1
      ) sub
    ), '[]'::jsonb),
    'urgent_alerts', coalesce((
      SELECT jsonb_agg(alert ORDER BY (alert->>'created_at') DESC)
      FROM (
        SELECT jsonb_build_object(
          'id', id::text,
          'type', 'moderation',
          'message', 'Job "' || title || '" pending review',
          'created_at', created_at
        ) AS alert
        FROM public.jobs
        WHERE status = 'Pending Review'
        ORDER BY created_at DESC
        LIMIT 5
      ) pending_jobs
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_platform_metrics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_platform_metrics() TO authenticated;
