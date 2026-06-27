-- Pricing v2 sets discovery plan_id on employer signup, but guard_employer_subscription_client_write
-- only allowed INSERT when plan_id IS NULL. Allow provisioning_signup inserts with active Discovery row.

CREATE OR REPLACE FUNCTION public.guard_employer_subscription_client_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  discovery_plan_id UUID;
BEGIN
  IF coalesce(auth.jwt() ->> 'role', '') = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF current_setting('app.provisioning_signup', true) = 'true' THEN
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
      IF NEW.plan_id IS NULL THEN
        RETURN NEW;
      END IF;

      SELECT id INTO discovery_plan_id
      FROM public.billing_plans
      WHERE slug = 'discovery'
      LIMIT 1;

      IF discovery_plan_id IS NOT NULL
        AND NEW.plan_id = discovery_plan_id
        AND coalesce(NEW.plan_slug, 'discovery') = 'discovery' THEN
        RETURN NEW;
      END IF;
    END IF;
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
