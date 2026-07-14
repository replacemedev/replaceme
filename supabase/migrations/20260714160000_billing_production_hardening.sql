-- Billing production hardening (2026):
-- out-of-order webhook guard, payment error capture, chargeback flags.
-- IMPORTANT: plan_slug drives entitlements; Discovery signup uses status=active.
-- Do NOT gate paid plan_slug behind status=active only in a way that breaks reads —
-- unpaid / dispute lost still force Discovery.

ALTER TABLE public.employer_subscriptions
  ADD COLUMN IF NOT EXISTS last_payment_error TEXT,
  ADD COLUMN IF NOT EXISTS last_stripe_event_created BIGINT,
  ADD COLUMN IF NOT EXISTS stripe_dispute_status TEXT,
  ADD COLUMN IF NOT EXISTS stripe_dispute_id TEXT;

COMMENT ON COLUMN public.employer_subscriptions.last_payment_error IS
  'Last Stripe payment/setup error message for admin debugging.';
COMMENT ON COLUMN public.employer_subscriptions.last_stripe_event_created IS
  'Unix created timestamp of last applied Stripe event — skips stale out-of-order deliveries.';
COMMENT ON COLUMN public.employer_subscriptions.stripe_dispute_status IS
  'Stripe chargeback status: warning_needs_response, under_review, won, lost, etc.';

CREATE INDEX IF NOT EXISTS idx_employer_subscriptions_at_risk
  ON public.employer_subscriptions (status)
  WHERE status IN ('past_due', 'unpaid', 'incomplete');

CREATE INDEX IF NOT EXISTS idx_employer_subscriptions_dispute
  ON public.employer_subscriptions (stripe_dispute_status)
  WHERE stripe_dispute_status IS NOT NULL;

CREATE OR REPLACE FUNCTION public.resolve_employer_plan_slug(p_employer_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT bp.slug
      FROM public.employer_subscriptions es
      JOIN public.billing_plans bp ON bp.id = es.override_plan_id
      WHERE es.employer_id = p_employer_id
        AND es.override_plan_id IS NOT NULL
        AND (es.override_expires_at IS NULL OR es.override_expires_at > timezone('utc'::text, now()))
      LIMIT 1
    ),
    (
      SELECT COALESCE(es.plan_slug, bp.slug, 'discovery')
      FROM public.employer_subscriptions es
      LEFT JOIN public.billing_plans bp ON bp.id = es.plan_id
      WHERE es.employer_id = p_employer_id
        AND (
          es.stripe_dispute_status IS NULL
          OR es.stripe_dispute_status NOT IN ('lost', 'charge_refunded')
        )
        AND COALESCE(es.status, 'inactive') NOT IN ('unpaid', 'incomplete_expired')
      LIMIT 1
    ),
    'discovery'
  );
$$;
