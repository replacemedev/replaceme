-- ============================================================
-- DATABASE SEED (SQL)
-- ============================================================
-- Auth users MUST be created via Supabase Auth Admin API so GoTrue
-- handles password hashing, identities, and JWT claims correctly.
--
-- After migrations / db reset, run:
--   npm run seed:admin
--
-- Credentials (dev only):
--   replacemeadmin@example.com / replacemeadmin123
-- ============================================================

DO $$
BEGIN
  INSERT INTO public.profiles (id, role, first_name, last_name, email, username)
  SELECT id, 'admin', 'Admin', 'User', email, 'replacemeadmin'
  FROM auth.users
  WHERE email = 'replacemeadmin@example.com'
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    updated_at = timezone('utc', now());

  RAISE NOTICE 'SQL seed complete. Run `npm run seed:admin` to sync auth password and JWT claims.';
END $$;
