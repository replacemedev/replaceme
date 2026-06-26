-- CMS: admin-managed public page content

CREATE TABLE IF NOT EXISTS public.page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('html', 'json')),
  body TEXT,
  content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_page_content_slug ON public.page_content (slug);
CREATE INDEX IF NOT EXISTS idx_page_content_published ON public.page_content (is_published);

ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Public read published page content' AND tablename = 'page_content'
  ) THEN
    CREATE POLICY "Public read published page content" ON public.page_content
      FOR SELECT USING (is_published = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Admins manage page content' AND tablename = 'page_content'
  ) THEN
    CREATE POLICY "Admins manage page content" ON public.page_content
      FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

COMMENT ON TABLE public.page_content IS 'Admin-managed copy for public informational pages (legal, help, pricing hero, etc.)';
