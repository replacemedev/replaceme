-- Orphan left after interviews table drop
DROP FUNCTION IF EXISTS public.handle_interviews_updated_at() CASCADE;
