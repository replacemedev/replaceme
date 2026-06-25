-- Break infinite RLS recursion: company_profiles_select_via_messaging ↔ chat_threads policies.
-- SECURITY DEFINER helpers read underlying tables without re-entering cross-table policies.

CREATE OR REPLACE FUNCTION public.employer_owns_company_profile(p_company_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_profiles cp
    WHERE cp.id = p_company_profile_id
      AND cp.employer_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.worker_has_chat_with_company_profile(p_company_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_threads ct
    WHERE ct.company_profile_id = p_company_profile_id
      AND ct.worker_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.profiles_share_chat_thread(p_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_threads ct
    JOIN public.company_profiles cp ON cp.id = ct.company_profile_id
    WHERE (
      ct.worker_id = p_profile_id AND cp.employer_id = auth.uid()
    ) OR (
      ct.worker_id = auth.uid() AND cp.employer_id = p_profile_id
    )
  );
$$;

REVOKE ALL ON FUNCTION public.employer_owns_company_profile(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.employer_owns_company_profile(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.worker_has_chat_with_company_profile(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.worker_has_chat_with_company_profile(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.profiles_share_chat_thread(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.profiles_share_chat_thread(uuid) TO authenticated;

DROP POLICY IF EXISTS "company_profiles_select_via_messaging" ON public.company_profiles;
CREATE POLICY "company_profiles_select_via_messaging"
  ON public.company_profiles FOR SELECT
  USING (public.worker_has_chat_with_company_profile(id));

DROP POLICY IF EXISTS "profiles_select_messaging_counterparties" ON public.profiles;
CREATE POLICY "profiles_select_messaging_counterparties"
  ON public.profiles FOR SELECT
  USING (public.profiles_share_chat_thread(id));

DROP POLICY IF EXISTS "Users can view threads they participate in" ON public.chat_threads;
CREATE POLICY "Users can view threads they participate in"
  ON public.chat_threads FOR SELECT
  USING (
    worker_id = auth.uid()
    OR public.employer_owns_company_profile(company_profile_id)
  );

DROP POLICY IF EXISTS "Users can insert threads they participate in" ON public.chat_threads;
CREATE POLICY "Users can insert threads they participate in"
  ON public.chat_threads FOR INSERT
  WITH CHECK (
    worker_id = auth.uid()
    OR public.employer_owns_company_profile(company_profile_id)
  );

DROP POLICY IF EXISTS "Users can update threads they participate in" ON public.chat_threads;
CREATE POLICY "Users can update threads they participate in"
  ON public.chat_threads FOR UPDATE
  USING (
    worker_id = auth.uid()
    OR public.employer_owns_company_profile(company_profile_id)
  )
  WITH CHECK (
    worker_id = auth.uid()
    OR public.employer_owns_company_profile(company_profile_id)
  );

DROP POLICY IF EXISTS "Users can view messages in their threads" ON public.chat_messages;
CREATE POLICY "Users can view messages in their threads"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_threads t
      WHERE t.id = thread_id
      AND (
        t.worker_id = auth.uid()
        OR public.employer_owns_company_profile(t.company_profile_id)
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert messages to their threads" ON public.chat_messages;
CREATE POLICY "Users can insert messages to their threads"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.chat_threads t
      WHERE t.id = thread_id
      AND (
        t.worker_id = auth.uid()
        OR public.employer_owns_company_profile(t.company_profile_id)
      )
    )
  );

DROP POLICY IF EXISTS "Users can update messages in their threads" ON public.chat_messages;
CREATE POLICY "Users can update messages in their threads"
  ON public.chat_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_threads t
      WHERE t.id = thread_id
      AND (
        t.worker_id = auth.uid()
        OR public.employer_owns_company_profile(t.company_profile_id)
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_threads t
      WHERE t.id = thread_id
      AND (
        t.worker_id = auth.uid()
        OR public.employer_owns_company_profile(t.company_profile_id)
      )
    )
  );
