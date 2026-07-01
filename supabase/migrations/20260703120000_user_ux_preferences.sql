-- UX preferences synced across devices for authenticated users

CREATE TABLE IF NOT EXISTS public.user_ux_preferences (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'system'
    CHECK (theme IN ('light', 'dark', 'system')),
  sidebar_collapsed BOOLEAN NOT NULL DEFAULT false,
  locale TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_ux_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own UX preferences" ON public.user_ux_preferences;
CREATE POLICY "Users manage own UX preferences"
  ON public.user_ux_preferences
  FOR ALL
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE INDEX IF NOT EXISTS idx_user_ux_preferences_updated_at
  ON public.user_ux_preferences (updated_at DESC);
