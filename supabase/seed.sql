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
  RAISE NOTICE 'SQL seed complete. Run `npm run seed:admin` to create the admin test account.';
END $$;
