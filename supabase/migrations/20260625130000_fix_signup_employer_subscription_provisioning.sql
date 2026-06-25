-- Signup fix: handle_new_user provisions employer_subscriptions, but
-- guard_employer_subscription_client_write blocked all non-service_role INSERTs.
-- Use a transaction-local flag so SECURITY DEFINER signup provisioning can insert
-- the default free-tier row (plan_id NULL, status active) only.

CREATE OR REPLACE FUNCTION public.guard_employer_subscription_client_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF coalesce(auth.jwt() ->> 'role', '') = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF current_setting('app.provisioning_signup', true) = 'true' THEN
    IF TG_OP = 'INSERT'
      AND NEW.plan_id IS NULL
      AND NEW.status = 'active' THEN
      RETURN NEW;
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
BEGIN
  PERFORM set_config('app.provisioning_signup', 'true', true);

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

    INSERT INTO public.employer_subscriptions (employer_id, plan_id, status)
    VALUES (new.id, NULL, 'active')
    ON CONFLICT (employer_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$;
