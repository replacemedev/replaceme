-- Admin billing ledger + subscription denormalized Stripe fields

ALTER TABLE public.employer_subscriptions
  ADD COLUMN IF NOT EXISTS unit_amount_cents INTEGER,
  ADD COLUMN IF NOT EXISTS billing_interval TEXT CHECK (billing_interval IN ('month', 'year')),
  ADD COLUMN IF NOT EXISTS last_payment_status TEXT,
  ADD COLUMN IF NOT EXISTS last_payment_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS failed_payment_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.billing_ledger_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_event_id TEXT NOT NULL UNIQUE,
  stripe_invoice_id TEXT,
  stripe_subscription_id TEXT,
  event_type TEXT NOT NULL,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  plan_slug TEXT,
  subscription_status TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_billing_ledger_employer_occurred
  ON public.billing_ledger_events (employer_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_billing_ledger_event_type_occurred
  ON public.billing_ledger_events (event_type, occurred_at DESC);

ALTER TABLE public.billing_ledger_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read billing ledger" ON public.billing_ledger_events;
CREATE POLICY "Admins read billing ledger"
  ON public.billing_ledger_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'::public.user_role
    )
    OR coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );

-- Backfill stripe customer from profiles where subscription row lacks one
UPDATE public.employer_subscriptions es
SET stripe_customer_id = p.stripe_customer_id,
    updated_at = timezone('utc'::text, now())
FROM public.profiles p
WHERE es.employer_id = p.id
  AND es.stripe_customer_id IS NULL
  AND p.stripe_customer_id IS NOT NULL;
