-- Layer 1B: Pricing v2 — four entitlement tiers, usage tracking, interviews, stage history, RLS helpers

-- =============================================================================
-- ENUMS
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE public.billing_identity_mode AS ENUM ('anonymous_preview', 'full');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.billing_approval_mode AS ENUM ('queued_2d', 'instant');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.entitlement_denial_type AS ENUM (
    'job_limit',
    'applicant_limit',
    'messaging',
    'resume',
    'identity'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.admin_role AS ENUM ('moderator', 'superadmin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.application_actor_role AS ENUM ('worker', 'employer', 'admin', 'system');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.interview_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- BILLING PLANS — entitlement columns
-- =============================================================================
ALTER TABLE public.billing_plans
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
  ADD COLUMN IF NOT EXISTS applicants_per_job_limit INTEGER,
  ADD COLUMN IF NOT EXISTS messaging_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS resume_download_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS identity_mode public.billing_identity_mode NOT NULL DEFAULT 'anonymous_preview',
  ADD COLUMN IF NOT EXISTS approval_mode public.billing_approval_mode NOT NULL DEFAULT 'queued_2d',
  ADD COLUMN IF NOT EXISTS priority_listing BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS priority_support BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS early_access BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_popular BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.billing_plans
  DROP CONSTRAINT IF EXISTS billing_plans_job_post_limit_check;

ALTER TABLE public.billing_plans
  ALTER COLUMN job_post_limit DROP NOT NULL;

COMMENT ON COLUMN public.billing_plans.job_post_limit IS 'Active jobs limit; NULL = unlimited (Scale)';
COMMENT ON COLUMN public.billing_plans.applicants_per_job_limit IS 'Per-job applicant cap; NULL = unlimited';
COMMENT ON COLUMN public.billing_plans.candidate_unlocks IS 'DEPRECATED — use entitlements (Layer 3B)';

-- Backfill slugs from legacy names before UNIQUE constraint
UPDATE public.billing_plans SET slug = 'discovery' WHERE name = 'Discovery' AND (slug IS NULL OR slug = '');
UPDATE public.billing_plans SET slug = 'starter' WHERE name = 'Essential' AND (slug IS NULL OR slug = '');
UPDATE public.billing_plans SET slug = 'growth' WHERE name = 'Professional' AND (slug IS NULL OR slug = '');

UPDATE public.billing_plans
SET
  name = 'Starter',
  slug = 'starter',
  price = 19,
  job_post_limit = 3,
  applicants_per_job_limit = 20,
  candidate_unlocks = 0,
  messaging_enabled = true,
  resume_download_enabled = true,
  identity_mode = 'full',
  approval_mode = 'instant',
  priority_listing = false,
  priority_support = false,
  early_access = false,
  display_order = 2,
  is_popular = false
WHERE slug = 'starter' OR name = 'Essential';

UPDATE public.billing_plans
SET
  name = 'Growth',
  slug = 'growth',
  price = 39,
  job_post_limit = 10,
  applicants_per_job_limit = 50,
  candidate_unlocks = 0,
  messaging_enabled = true,
  resume_download_enabled = true,
  identity_mode = 'full',
  approval_mode = 'instant',
  priority_listing = true,
  priority_support = false,
  early_access = false,
  display_order = 3,
  is_popular = true
WHERE slug = 'growth' OR name = 'Professional';

UPDATE public.billing_plans
SET
  name = 'Discovery',
  slug = 'discovery',
  price = 0,
  job_post_limit = 1,
  applicants_per_job_limit = 10,
  candidate_unlocks = 0,
  messaging_enabled = false,
  resume_download_enabled = false,
  identity_mode = 'anonymous_preview',
  approval_mode = 'queued_2d',
  priority_listing = false,
  priority_support = false,
  early_access = false,
  display_order = 1,
  is_popular = false
WHERE slug = 'discovery' OR name = 'Discovery';

INSERT INTO public.billing_plans (
  name,
  slug,
  price,
  job_post_limit,
  applicants_per_job_limit,
  candidate_unlocks,
  messaging_enabled,
  resume_download_enabled,
  identity_mode,
  approval_mode,
  priority_listing,
  priority_support,
  early_access,
  display_order,
  is_popular
)
SELECT
  'Scale',
  'scale',
  79,
  NULL,
  NULL,
  0,
  true,
  true,
  'full',
  'instant',
  true,
  true,
  true,
  4,
  false
WHERE NOT EXISTS (SELECT 1 FROM public.billing_plans WHERE slug = 'scale');

CREATE UNIQUE INDEX IF NOT EXISTS billing_plans_slug_unique ON public.billing_plans (slug);

-- =============================================================================
-- EMPLOYER SUBSCRIPTIONS — Stripe sync + admin override
-- =============================================================================
ALTER TABLE public.employer_subscriptions DISABLE TRIGGER guard_employer_subscription_client_write;

ALTER TABLE public.employer_subscriptions
  ADD COLUMN IF NOT EXISTS plan_slug TEXT,
  ADD COLUMN IF NOT EXISTS billing_period_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS billing_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_stripe_event_id TEXT,
  ADD COLUMN IF NOT EXISTS override_plan_id UUID REFERENCES public.billing_plans(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS override_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS override_reason TEXT,
  ADD COLUMN IF NOT EXISTS override_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

UPDATE public.employer_subscriptions es
SET plan_slug = bp.slug
FROM public.billing_plans bp
WHERE es.plan_id = bp.id
  AND es.plan_slug IS NULL;

UPDATE public.employer_subscriptions es
SET
  plan_id = (SELECT id FROM public.billing_plans WHERE slug = 'discovery' LIMIT 1),
  plan_slug = 'discovery'
WHERE es.plan_id IS NULL
  AND es.status IN ('active', 'trialing', 'inactive');

UPDATE public.employer_subscriptions
SET billing_period_end = current_period_end
WHERE billing_period_end IS NULL
  AND current_period_end IS NOT NULL;

ALTER TABLE public.employer_subscriptions ENABLE TRIGGER guard_employer_subscription_client_write;

-- =============================================================================
-- NEW TABLES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_role public.admin_role NOT NULL DEFAULT 'moderator',
  display_name TEXT,
  avatar_url TEXT,
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.employer_plan_usage (
  employer_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  active_jobs_count INTEGER NOT NULL DEFAULT 0 CHECK (active_jobs_count >= 0),
  period_applicants_received INTEGER NOT NULL DEFAULT 0 CHECK (period_applicants_received >= 0),
  period_messages_sent INTEGER NOT NULL DEFAULT 0 CHECK (period_messages_sent >= 0),
  computed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.entitlement_denials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  denial_type public.entitlement_denial_type NOT NULL,
  resource_id UUID,
  plan_slug TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_entitlement_denials_employer_created
  ON public.entitlement_denials (employer_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  payload_hash TEXT,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.application_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_role public.application_actor_role NOT NULL DEFAULT 'system',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_application_stage_history_application
  ON public.application_stage_history (application_id, created_at ASC);

CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  meeting_url TEXT,
  status public.interview_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT interviews_application_unique UNIQUE (application_id)
);

CREATE INDEX IF NOT EXISTS idx_interviews_employer_scheduled
  ON public.interviews (employer_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_interviews_worker_scheduled
  ON public.interviews (worker_id, scheduled_at DESC);

-- =============================================================================
-- EXTEND MARKETPLACE TABLES
-- =============================================================================
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS submitted_for_review_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS paused_reason TEXT,
  ADD COLUMN IF NOT EXISTS priority_score INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS application_cap_reached_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS visible_applicant_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS is_within_plan_cap BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS masked_preview_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS received_at TIMESTAMPTZ;

UPDATE public.applications
SET received_at = created_at
WHERE received_at IS NULL;

ALTER TABLE public.chat_threads
  ADD COLUMN IF NOT EXISTS blocked_reason TEXT;

-- =============================================================================
-- PROFILES & COMPANY — worker / employer enrichment
-- =============================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS expected_salary_min NUMERIC,
  ADD COLUMN IF NOT EXISTS expected_salary_max NUMERIC,
  ADD COLUMN IF NOT EXISTS salary_currency TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS availability_status TEXT,
  ADD COLUMN IF NOT EXISTS profile_visibility TEXT NOT NULL DEFAULT 'platform',
  ADD COLUMN IF NOT EXISTS resume_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

ALTER TABLE public.company_profiles
  ADD COLUMN IF NOT EXISTS hiring_regions TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS timezone TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS company_verification_status TEXT NOT NULL DEFAULT 'unverified';

ALTER TABLE public.worker_skills
  ADD COLUMN IF NOT EXISTS proficiency_level TEXT,
  ADD COLUMN IF NOT EXISTS years_with_skill INTEGER CHECK (years_with_skill IS NULL OR years_with_skill >= 0),
  ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false;

-- =============================================================================
-- ENTITLEMENT HELPERS
-- =============================================================================
CREATE OR REPLACE FUNCTION public.resolve_employer_plan_slug(p_employer_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT bp.slug
      FROM public.employer_subscriptions es
      JOIN public.billing_plans bp ON bp.id = es.override_plan_id
      WHERE es.employer_id = p_employer_id
        AND es.override_plan_id IS NOT NULL
        AND (es.override_expires_at IS NULL OR es.override_expires_at > timezone('utc'::text, now()))
      LIMIT 1
    ),
    (
      SELECT COALESCE(es.plan_slug, bp.slug, 'discovery')
      FROM public.employer_subscriptions es
      LEFT JOIN public.billing_plans bp ON bp.id = es.plan_id
      WHERE es.employer_id = p_employer_id
      LIMIT 1
    ),
    'discovery'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_employer_entitlements(p_employer_id UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'plan_slug', bp.slug,
    'active_jobs_limit', bp.job_post_limit,
    'applicants_per_job_limit', bp.applicants_per_job_limit,
    'messaging_enabled', bp.messaging_enabled,
    'resume_download_enabled', bp.resume_download_enabled,
    'identity_mode', bp.identity_mode::text,
    'approval_mode', bp.approval_mode::text,
    'priority_listing', bp.priority_listing,
    'priority_support', bp.priority_support,
    'early_access', bp.early_access,
    'price', bp.price,
    'display_name', bp.name
  )
  FROM public.billing_plans bp
  WHERE bp.slug = public.resolve_employer_plan_slug(p_employer_id)
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.employer_has_full_identity(p_employer_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (public.get_employer_entitlements(p_employer_id) ->> 'identity_mode') = 'full',
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.employer_messaging_enabled(p_employer_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (public.get_employer_entitlements(p_employer_id) ->> 'messaging_enabled')::boolean,
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.get_applicant_preview(
  p_application_id UUID,
  p_employer_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_app RECORD;
  v_worker RECORD;
  v_full BOOLEAN;
BEGIN
  SELECT a.id, a.job_id, a.candidate_id, a.status, a.match_score, a.masked_preview_snapshot
  INTO v_app
  FROM public.applications a
  JOIN public.jobs j ON j.id = a.job_id
  WHERE a.id = p_application_id
    AND j.employer_id = p_employer_id;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  v_full := public.employer_has_full_identity(p_employer_id);

  SELECT
    p.id,
    p.first_name,
    p.last_name,
    p.email,
    p.avatar_url,
    p.professional_title,
    p.bio,
    p.experience_years,
    p.skills,
    p.resume_url,
    p.expected_salary_min,
    p.expected_salary_max,
    p.salary_currency
  INTO v_worker
  FROM public.profiles p
  WHERE p.id = v_app.candidate_id;

  IF v_full THEN
    RETURN jsonb_build_object(
      'application_id', v_app.id,
      'job_id', v_app.job_id,
      'status', v_app.status,
      'match_score', v_app.match_score,
      'identity_mode', 'full',
      'candidate', to_jsonb(v_worker)
    );
  END IF;

  RETURN jsonb_build_object(
    'application_id', v_app.id,
    'job_id', v_app.job_id,
    'status', v_app.status,
    'match_score', v_app.match_score,
    'identity_mode', 'anonymous_preview',
    'candidate', jsonb_build_object(
      'id', v_worker.id,
      'skills', v_worker.skills,
      'experience_years', v_worker.experience_years,
      'expected_salary_min', v_worker.expected_salary_min,
      'expected_salary_max', v_worker.expected_salary_max,
      'salary_currency', v_worker.salary_currency,
      'professional_title', v_worker.professional_title
    ),
    'snapshot', v_app.masked_preview_snapshot
  );
END;
$$;

-- Log application status changes for ApplicationTimeline (Layer 4B)
CREATE OR REPLACE FUNCTION public.log_application_stage_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.application_stage_history (
      application_id,
      status,
      actor_id,
      actor_role
    ) VALUES (
      NEW.id,
      NEW.status,
      auth.uid(),
      CASE
        WHEN public.is_admin() THEN 'admin'::public.application_actor_role
        WHEN EXISTS (
          SELECT 1 FROM public.jobs j
          WHERE j.id = NEW.job_id AND j.employer_id = auth.uid()
        ) THEN 'employer'::public.application_actor_role
        WHEN NEW.candidate_id = auth.uid() THEN 'worker'::public.application_actor_role
        ELSE 'system'::public.application_actor_role
      END
    );
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.application_stage_history (
      application_id,
      status,
      actor_id,
      actor_role
    ) VALUES (
      NEW.id,
      NEW.status,
      auth.uid(),
      CASE
        WHEN public.is_admin() THEN 'admin'::public.application_actor_role
        WHEN EXISTS (
          SELECT 1 FROM public.jobs j
          WHERE j.id = NEW.job_id AND j.employer_id = auth.uid()
        ) THEN 'employer'::public.application_actor_role
        WHEN NEW.candidate_id = auth.uid() THEN 'worker'::public.application_actor_role
        ELSE 'system'::public.application_actor_role
      END
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS applications_stage_history ON public.applications;
CREATE TRIGGER applications_stage_history
  AFTER INSERT OR UPDATE OF status ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.log_application_stage_change();

CREATE OR REPLACE FUNCTION public.handle_interviews_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS interviews_updated_at ON public.interviews;
CREATE TRIGGER interviews_updated_at
  BEFORE UPDATE ON public.interviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_interviews_updated_at();

-- =============================================================================
-- SIGNUP — default Discovery plan
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_val public.user_role;
  input_username TEXT;
  final_username TEXT;
  discovery_plan_id UUID;
BEGIN
  PERFORM set_config('app.provisioning_signup', 'true', true);

  SELECT id INTO discovery_plan_id
  FROM public.billing_plans
  WHERE slug = 'discovery'
  LIMIT 1;

  BEGIN
    user_role_val := COALESCE(
      (new.raw_user_meta_data->>'role')::public.user_role,
      'worker'::public.user_role
    );
  EXCEPTION WHEN OTHERS THEN
    user_role_val := 'worker'::public.user_role;
  END;

  input_username := COALESCE(
    new.raw_user_meta_data->>'username',
    'user_' || substr(new.id::text, 1, 8)
  );
  final_username := input_username;

  IF EXISTS (
    SELECT 1 FROM public.profiles WHERE username = final_username
  ) OR EXISTS (
    SELECT 1 FROM public.company_profiles WHERE username = final_username
  ) THEN
    RAISE EXCEPTION 'Username "%" is already taken.', final_username USING ERRCODE = '23505';
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    username,
    first_name,
    last_name,
    role
  ) VALUES (
    new.id,
    new.email,
    final_username,
    COALESCE(new.raw_user_meta_data->>'first_name', 'Unknown'),
    new.raw_user_meta_data->>'last_name',
    user_role_val
  ) ON CONFLICT (id) DO NOTHING;

  IF user_role_val = 'employer'::public.user_role THEN
    INSERT INTO public.company_profiles (employer_id, company_name, username, role)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'company_name', 'Unknown Company'),
      final_username,
      user_role_val
    )
    ON CONFLICT (employer_id) DO NOTHING;

    INSERT INTO public.employer_credits (employer_id, credits_balance)
    VALUES (new.id, 5)
    ON CONFLICT (employer_id) DO NOTHING;

    INSERT INTO public.employer_subscriptions (employer_id, plan_id, plan_slug, status)
    VALUES (new.id, discovery_plan_id, 'discovery', 'active')
    ON CONFLICT (employer_id) DO NOTHING;

    INSERT INTO public.employer_plan_usage (employer_id)
    VALUES (new.id)
    ON CONFLICT (employer_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$;

-- =============================================================================
-- RLS — new tables
-- =============================================================================
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_plan_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlement_denials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins read admin profiles' AND tablename = 'admin_profiles'
  ) THEN
    CREATE POLICY "Admins read admin profiles" ON public.admin_profiles
      FOR SELECT USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage admin profiles' AND tablename = 'admin_profiles'
  ) THEN
    CREATE POLICY "Admins manage admin profiles" ON public.admin_profiles
      FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Employers read own plan usage' AND tablename = 'employer_plan_usage'
  ) THEN
    CREATE POLICY "Employers read own plan usage" ON public.employer_plan_usage
      FOR SELECT USING (employer_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins read all plan usage' AND tablename = 'employer_plan_usage'
  ) THEN
    CREATE POLICY "Admins read all plan usage" ON public.employer_plan_usage
      FOR SELECT USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Employers read own denials' AND tablename = 'entitlement_denials'
  ) THEN
    CREATE POLICY "Employers read own denials" ON public.entitlement_denials
      FOR SELECT USING (employer_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins read all denials' AND tablename = 'entitlement_denials'
  ) THEN
    CREATE POLICY "Admins read all denials" ON public.entitlement_denials
      FOR SELECT USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins read webhook events' AND tablename = 'stripe_webhook_events'
  ) THEN
    CREATE POLICY "Admins read webhook events" ON public.stripe_webhook_events
      FOR SELECT USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Participants read application stage history' AND tablename = 'application_stage_history'
  ) THEN
    CREATE POLICY "Participants read application stage history" ON public.application_stage_history
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.applications a
          JOIN public.jobs j ON j.id = a.job_id
          WHERE a.id = application_id
            AND (a.candidate_id = auth.uid() OR j.employer_id = auth.uid())
        )
        OR public.is_admin()
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Employers and workers read own interviews' AND tablename = 'interviews'
  ) THEN
    CREATE POLICY "Employers and workers read own interviews" ON public.interviews
      FOR SELECT USING (
        employer_id = auth.uid()
        OR worker_id = auth.uid()
        OR public.is_admin()
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Employers manage interviews for own jobs' AND tablename = 'interviews'
  ) THEN
    CREATE POLICY "Employers manage interviews for own jobs" ON public.interviews
      FOR ALL USING (employer_id = auth.uid())
      WITH CHECK (employer_id = auth.uid());
  END IF;
END $$;

-- Tighten applicant profile access: full row only when identity entitlement allows
DROP POLICY IF EXISTS "profiles_select_applicants_for_employer" ON public.profiles;

CREATE POLICY "profiles_select_applicants_for_employer"
  ON public.profiles FOR SELECT
  USING (
    role = 'worker'
    AND public.employer_has_full_identity(auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      WHERE a.candidate_id = profiles.id
        AND j.employer_id = auth.uid()
    )
  );

-- Employers on Discovery still need preview via get_applicant_preview() (SECURITY DEFINER)

-- Messaging threads: employers without messaging cannot insert new threads
DROP POLICY IF EXISTS "Users can insert threads they participate in" ON public.chat_threads;

CREATE POLICY "Users can insert threads they participate in" ON public.chat_threads
  FOR INSERT WITH CHECK (
    worker_id = auth.uid()
    OR (
      EXISTS (
        SELECT 1 FROM public.company_profiles cp
        WHERE cp.id = company_profile_id
          AND cp.employer_id = auth.uid()
      )
      AND public.employer_messaging_enabled(auth.uid())
    )
  );

-- Grant execute on entitlement RPCs to authenticated users
GRANT EXECUTE ON FUNCTION public.get_employer_entitlements(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_employer_plan_slug(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.employer_has_full_identity(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.employer_messaging_enabled(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_applicant_preview(UUID, UUID) TO authenticated;
