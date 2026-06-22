-- Add role column to company_profiles table if it does not exist
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS role public.user_role DEFAULT 'employer'::public.user_role;

-- Ensure unique constraint exists on profiles.username
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_username_key' AND conrelid = 'public.profiles'::regclass
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
    END IF;
END $$;

-- Ensure unique constraint exists on company_profiles.username
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'company_profiles_username_key' AND conrelid = 'public.company_profiles'::regclass
    ) THEN
        ALTER TABLE public.company_profiles ADD CONSTRAINT company_profiles_username_key UNIQUE (username);
    END IF;
END $$;

-- Re-architect handle_new_user trigger with strict role validation and global username checks
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
  -- 1. Extract and cast user role from metadata
  BEGIN
    user_role_val := COALESCE(
      (new.raw_user_meta_data->>'role')::public.user_role,
      'worker'::public.user_role
    );
  EXCEPTION WHEN OTHERS THEN
    user_role_val := 'worker'::public.user_role;
  END;

  -- 2. Extract input username or fallback to a default
  input_username := COALESCE(
    new.raw_user_meta_data->>'username',
    'user_' || substr(new.id::text, 1, 8)
  );
  final_username := input_username;

  -- 3. Enforce global username uniqueness across both profiles and company_profiles
  IF EXISTS (
    SELECT 1 FROM public.profiles WHERE username = final_username
  ) OR EXISTS (
    SELECT 1 FROM public.company_profiles WHERE username = final_username
  ) THEN
    RAISE EXCEPTION 'Username "%" is already taken.', final_username USING ERRCODE = '23505';
  END IF;

  -- 4. Insert base profile
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

  -- 5. Route specific inserts based on role
  IF user_role_val = 'employer'::public.user_role THEN
    -- Provision Company Profile
    INSERT INTO public.company_profiles (employer_id, company_name, username, role)
    VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data->>'company_name', 'Unknown Company'),
      final_username,
      user_role_val
    )
    ON CONFLICT (employer_id) DO NOTHING;
    
    -- Provision Default Credits
    INSERT INTO public.employer_credits (employer_id, credits_balance)
    VALUES (new.id, 5)
    ON CONFLICT (employer_id) DO NOTHING;
    
    -- Provision Default Subscription (Free Tier)
    INSERT INTO public.employer_subscriptions (employer_id, plan_id, status)
    VALUES (new.id, NULL, 'active')
    ON CONFLICT (employer_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$;
