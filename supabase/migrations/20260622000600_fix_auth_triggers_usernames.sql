-- Ensure username exists in profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- Add unique constraint on profiles.username if not already present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_username_key' AND conrelid = 'public.profiles'::regclass
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
    END IF;
END $$;

-- Alter company_profiles to add username column
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- Add unique constraint on company_profiles.username if not already present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'company_profiles_username_key' AND conrelid = 'public.company_profiles'::regclass
    ) THEN
        ALTER TABLE public.company_profiles ADD CONSTRAINT company_profiles_username_key UNIQUE (username);
    END IF;
END $$;

-- Rewrite trigger function to prevent 500 crashes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_profile_id UUID;
  user_role_val public.user_role;
  base_username TEXT;
  final_username TEXT;
  suffix_counter INTEGER := 1;
BEGIN
  -- Cast the role from metadata, default to 'worker' if not provided or invalid
  BEGIN
    user_role_val := COALESCE(
      (new.raw_user_meta_data->>'role')::public.user_role,
      'worker'::public.user_role
    );
  EXCEPTION WHEN OTHERS THEN
    user_role_val := 'worker'::public.user_role;
  END;

  -- Ensure username is unique and not null
  base_username := COALESCE(
    new.raw_user_meta_data->>'username',
    'user_' || substr(new.id::text, 1, 8)
  );
  final_username := base_username;
  
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    final_username := base_username || suffix_counter::text;
    suffix_counter := suffix_counter + 1;
  END LOOP;

  -- Insert into profiles
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

  -- Insert into specific role tables and provision default settings
  IF user_role_val = 'employer'::public.user_role THEN
    -- Provision Company Profile
    INSERT INTO public.company_profiles (employer_id, company_name, username)
    VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data->>'company_name', 'Unknown Company'),
      final_username
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
