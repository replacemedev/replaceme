-- Phase 2: Worker UI — job alerts, skill assessments catalog, disputes filing, contract offers

CREATE TABLE IF NOT EXISTS public.worker_job_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  search_query TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('instant', 'daily', 'weekly')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_worker_job_alerts_worker
  ON public.worker_job_alerts (worker_id, created_at DESC);

ALTER TABLE public.worker_job_alerts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Workers manage own job alerts' AND tablename = 'worker_job_alerts'
  ) THEN
    CREATE POLICY "Workers manage own job alerts" ON public.worker_job_alerts
      FOR ALL USING (auth.uid() = worker_id) WITH CHECK (auth.uid() = worker_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.skill_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  skill_name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (duration_minutes > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.skill_assessments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view active skill assessments' AND tablename = 'skill_assessments'
  ) THEN
    CREATE POLICY "Anyone can view active skill assessments" ON public.skill_assessments
      FOR SELECT USING (is_active = true);
  END IF;
END $$;

DO $$ BEGIN
  CREATE TYPE public.dispute_status AS ENUM ('open', 'under_review', 'resolved', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status public.dispute_status NOT NULL DEFAULT 'open'::public.dispute_status,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  employer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Workers insert own disputes' AND tablename = 'disputes'
  ) THEN
    CREATE POLICY "Workers insert own disputes" ON public.disputes
      FOR INSERT WITH CHECK (auth.uid() = worker_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Workers read own disputes' AND tablename = 'disputes'
  ) THEN
    CREATE POLICY "Workers read own disputes" ON public.disputes
      FOR SELECT USING (auth.uid() = worker_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins read disputes' AND tablename = 'disputes'
  ) THEN
    CREATE POLICY "Admins read disputes" ON public.disputes
      FOR SELECT USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins update disputes' AND tablename = 'disputes'
  ) THEN
    CREATE POLICY "Admins update disputes" ON public.disputes
      FOR UPDATE USING (public.is_admin());
  END IF;
END $$;

ALTER TABLE public.contracts DROP CONSTRAINT IF EXISTS contracts_status_check;
ALTER TABLE public.contracts
  ADD CONSTRAINT contracts_status_check
  CHECK (status IN ('offered', 'active', 'declined', 'paused', 'terminated'));

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Workers can respond to offered contracts' AND tablename = 'contracts'
  ) THEN
    CREATE POLICY "Workers can respond to offered contracts" ON public.contracts
      FOR UPDATE
      USING (auth.uid() = worker_id AND status = 'offered')
      WITH CHECK (auth.uid() = worker_id AND status IN ('active', 'declined'));
  END IF;
END $$;
