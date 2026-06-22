-- Create custom types
CREATE TYPE user_role AS ENUM ('employer', 'worker', 'admin');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    role user_role NOT NULL,
    username TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Employers table
CREATE TABLE employers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    company_name TEXT,
    company_size TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Workers table
CREATE TABLE workers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    professional_title TEXT,
    bio TEXT,
    skills TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone."
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile."
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Employers Policies
CREATE POLICY "Public employers are viewable by everyone."
ON employers FOR SELECT
USING (true);

CREATE POLICY "Employers can insert their own data."
ON employers FOR INSERT
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Employers can update own data."
ON employers FOR UPDATE
USING (auth.uid() = profile_id);

-- Workers Policies
CREATE POLICY "Public workers are viewable by everyone."
ON workers FOR SELECT
USING (true);

CREATE POLICY "Workers can insert their own data."
ON workers FOR INSERT
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Workers can update own data."
ON workers FOR UPDATE
USING (auth.uid() = profile_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_profile_id UUID;
  user_role_val user_role;
BEGIN
  BEGIN
    user_role_val := (new.raw_user_meta_data->>'role')::user_role;
  EXCEPTION WHEN OTHERS THEN
    user_role_val := 'worker'::user_role;
  END;

  INSERT INTO public.profiles (
    auth_user_id,
    email,
    username,
    first_name,
    last_name,
    role
  ) VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    COALESCE(new.raw_user_meta_data->>'first_name', 'Unknown'),
    new.raw_user_meta_data->>'last_name',
    user_role_val
  ) RETURNING id INTO new_profile_id;

  IF user_role_val = 'employer'::user_role THEN
    INSERT INTO public.employers (profile_id, company_name)
    VALUES (new_profile_id, COALESCE(new.raw_user_meta_data->>'company_name', 'Unknown Company'));
  ELSIF user_role_val = 'worker'::user_role THEN
    INSERT INTO public.workers (profile_id)
    VALUES (new_profile_id);
  END IF;

  RETURN new;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
