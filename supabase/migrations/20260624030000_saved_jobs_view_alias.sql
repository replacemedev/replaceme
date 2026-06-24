-- Semantic alias: saved_jobs maps to worker_saved_jobs (canonical bookmark junction).
CREATE OR REPLACE VIEW public.saved_jobs AS
SELECT
  id,
  worker_id,
  job_id,
  created_at
FROM public.worker_saved_jobs;

COMMENT ON VIEW public.saved_jobs IS 'Worker bookmarked jobs junction (alias of worker_saved_jobs)';
