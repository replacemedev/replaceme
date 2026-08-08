-- Harden get_applicant_preview: authenticated + service_role only.
REVOKE ALL ON FUNCTION public.get_applicant_preview(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_applicant_preview(uuid, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_applicant_preview(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_applicant_preview(uuid, uuid) TO service_role;
