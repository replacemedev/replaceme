-- Phase 4 Section 2: Immediate security hotfixes

-- =============================================================================
-- #9 get_platform_metrics — service_role only (admin pages use createAdminClient)
-- =============================================================================
REVOKE ALL ON FUNCTION public.get_platform_metrics() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_platform_metrics() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_platform_metrics() TO service_role;

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
  IF coalesce(auth.jwt() ->> 'role', '') <> 'service_role' AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'admin access required';
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

-- =============================================================================
-- #10 FORCE ROW LEVEL SECURITY on all public tables
-- =============================================================================
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format(
      'ALTER TABLE public.%I FORCE ROW LEVEL SECURITY',
      tbl.tablename
    );
  END LOOP;
END $$;

-- =============================================================================
-- #11 employer_subscriptions — clients read-only; billing writes via service_role
-- =============================================================================
DROP POLICY IF EXISTS "Employers can update their own subscription" ON public.employer_subscriptions;
DROP POLICY IF EXISTS "Employers can insert their own subscription row" ON public.employer_subscriptions;
DROP POLICY IF EXISTS "Employers can delete their own subscription row" ON public.employer_subscriptions;

CREATE OR REPLACE FUNCTION public.guard_employer_subscription_client_write()
RETURNS trigger
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

DROP TRIGGER IF EXISTS guard_employer_subscription_client_write ON public.employer_subscriptions;
CREATE TRIGGER guard_employer_subscription_client_write
  BEFORE INSERT OR UPDATE ON public.employer_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_employer_subscription_client_write();

-- =============================================================================
-- #15 profiles.email — unique when present (case-insensitive)
-- =============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique_lower_idx
  ON public.profiles (lower(email))
  WHERE email IS NOT NULL;

-- =============================================================================
-- #20 jobs — remove fake hiring manager defaults
-- =============================================================================
ALTER TABLE public.jobs
  ALTER COLUMN hiring_manager_name DROP DEFAULT,
  ALTER COLUMN hiring_manager_role DROP DEFAULT,
  ALTER COLUMN hiring_manager_email DROP DEFAULT;

UPDATE public.jobs
SET
  hiring_manager_name = NULL
WHERE hiring_manager_name = 'Sarah Jenkins';

UPDATE public.jobs
SET
  hiring_manager_role = NULL
WHERE hiring_manager_role = 'Lead Recruiter';

UPDATE public.jobs
SET
  hiring_manager_email = NULL
WHERE hiring_manager_email = 'recruiting@replaceme.com';
