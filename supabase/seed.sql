-- ============================================================
-- ADMIN TEST ACCOUNT SEED
-- Creates a test admin user with proper app_metadata claims.
-- Run locally via: supabase db reset (applies migrations + seed)
-- ============================================================

DO $$
DECLARE
  admin_uid UUID;
BEGIN
  -- Only seed if this admin doesn't already exist
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'replacemeadmin@example.com'
  ) THEN
    -- Insert into auth.users with hashed password and admin claim
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'replacemeadmin@example.com',
      crypt('replacemeadmin123', gen_salt('bf')),
      now(),
      '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
      '{"first_name": "Admin", "last_name": "User"}'::jsonb,
      now(),
      now(),
      '',
      ''
    )
    RETURNING id INTO admin_uid;

    -- Create identity record for email auth
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      admin_uid,
      'replacemeadmin@example.com',
      jsonb_build_object('sub', admin_uid::text, 'email', 'replacemeadmin@example.com'),
      'email',
      now(),
      now(),
      now()
    );

    -- Insert matching profile row with admin role
    -- USING "ON CONFLICT" TO BYPASS AUTO-CREATION TRIGGERS
    INSERT INTO public.profiles (
      id,
      role,
      first_name,
      last_name,
      email,
      username,
      created_at,
      updated_at
    ) VALUES (
      admin_uid,
      'admin',
      'Admin',
      'User',
      'replacemeadmin@example.com',
      'replacemeadmin',
      now(),
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      role = EXCLUDED.role,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      email = EXCLUDED.email,
      username = EXCLUDED.username,
      updated_at = now();

    RAISE NOTICE 'Admin test account created: replacemeadmin@example.com / replacemeadmin123';
  ELSE
    RAISE NOTICE 'Admin test account already exists, skipping seed.';
  END IF;
END $$;