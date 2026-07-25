-- Remove admin CMS table; public page copy now lives in frontend static data.
DROP POLICY IF EXISTS "Public read published page content" ON public.page_content;
DROP POLICY IF EXISTS "Admins manage page content" ON public.page_content;
DROP INDEX IF EXISTS public.idx_page_content_slug;
DROP INDEX IF EXISTS public.idx_page_content_published;
DROP TABLE IF EXISTS public.page_content;
