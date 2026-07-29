-- Annual prepaid: yearly Stripe prices + prepaid USD amounts on billing_plans.
-- Monthly catalog stays in price / stripe_price_id.
-- Annual display = annual_price / 12; Stripe charges annual_price once per year.

ALTER TABLE public.billing_plans
  ADD COLUMN IF NOT EXISTS annual_price numeric,
  ADD COLUMN IF NOT EXISTS stripe_price_id_yearly text;

COMMENT ON COLUMN public.billing_plans.annual_price IS
  'Yearly prepaid list price in USD (tax-exclusive). UI shows annual_price/12 as monthly equivalent.';
COMMENT ON COLUMN public.billing_plans.stripe_price_id_yearly IS
  'Stripe Price id with recurring.interval=year for this plan.';

-- Sandbox yearly Price ids (Replace Me sandbox). Re-seed on other envs after creating Stripe prices.
UPDATE public.billing_plans
SET annual_price = 156,
    stripe_price_id_yearly = COALESCE(
      stripe_price_id_yearly,
      'price_1TybEG04XnBh2V7aZBxzhKst'
    )
WHERE slug = 'starter';

UPDATE public.billing_plans
SET annual_price = 312,
    stripe_price_id_yearly = COALESCE(
      stripe_price_id_yearly,
      'price_1TybEH04XnBh2V7adkdmowiB'
    )
WHERE slug = 'growth';

UPDATE public.billing_plans
SET annual_price = 624,
    stripe_price_id_yearly = COALESCE(
      stripe_price_id_yearly,
      'price_1TybEL04XnBh2V7avnbFkbyH'
    )
WHERE slug = 'scale';

UPDATE public.billing_plans
SET annual_price = NULL,
    stripe_price_id_yearly = NULL
WHERE slug = 'discovery';
