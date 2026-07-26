-- Case Center fields for unified Trust & Safety disputes (non-binding facilitation; no escrow).

ALTER TABLE public.user_reports
  ADD COLUMN IF NOT EXISTS case_stage TEXT NOT NULL DEFAULT 'awaiting_evidence',
  ADD COLUMN IF NOT EXISTS disputed_amount_cents INTEGER NULL,
  ADD COLUMN IF NOT EXISTS disputed_currency TEXT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS defendant_response TEXT NULL,
  ADD COLUMN IF NOT EXISTS resolution_outcome TEXT NULL;

ALTER TABLE public.user_reports
  DROP CONSTRAINT IF EXISTS user_reports_case_stage_allowed;

ALTER TABLE public.user_reports
  ADD CONSTRAINT user_reports_case_stage_allowed
  CHECK (case_stage IN (
    'awaiting_evidence',
    'in_mediation',
    'arbitration_noted',
    'resolved',
    'dismissed'
  ));

ALTER TABLE public.user_reports
  DROP CONSTRAINT IF EXISTS user_reports_resolution_outcome_allowed;

ALTER TABLE public.user_reports
  ADD CONSTRAINT user_reports_resolution_outcome_allowed
  CHECK (
    resolution_outcome IS NULL
    OR resolution_outcome IN (
      'non_binding_recommendation',
      'favor_employer_recorded',
      'favor_worker_recorded',
      'mutual_closure',
      'funds_at_risk_noted',
      'policy_warn',
      'policy_suspend',
      'dismissed'
    )
  );

ALTER TABLE public.user_reports
  DROP CONSTRAINT IF EXISTS user_reports_disputed_amount_nonneg;

ALTER TABLE public.user_reports
  ADD CONSTRAINT user_reports_disputed_amount_nonneg
  CHECK (disputed_amount_cents IS NULL OR disputed_amount_cents >= 0);

-- Backfill stage from existing status
UPDATE public.user_reports
SET case_stage = CASE status
  WHEN 'resolved' THEN 'resolved'
  WHEN 'dismissed' THEN 'dismissed'
  WHEN 'investigating' THEN 'in_mediation'
  ELSE 'awaiting_evidence'
END
WHERE case_stage = 'awaiting_evidence'
  AND status IN ('resolved', 'dismissed', 'investigating');

CREATE INDEX IF NOT EXISTS user_reports_case_stage_created_at_idx
  ON public.user_reports (case_stage, created_at DESC);

COMMENT ON COLUMN public.user_reports.case_stage IS
  'T&S case workflow stage. Advisory only — platform does not hold engagement escrow.';
COMMENT ON COLUMN public.user_reports.resolution_outcome IS
  'Non-binding case outcome recorded by admins. Does not move funds.';
COMMENT ON COLUMN public.user_reports.disputed_amount_cents IS
  'Optional claimed amount for wage/payment concerns. Not an escrow balance.';
