-- Persistent scheduled plan changes (period-end downgrades via Stripe Subscription Schedules)
alter table public.employer_subscriptions
  add column if not exists scheduled_plan_slug text,
  add column if not exists scheduled_effective_at timestamptz;

comment on column public.employer_subscriptions.scheduled_plan_slug is
  'Paid tier scheduled to take effect at scheduled_effective_at (Stripe subscription schedule).';
comment on column public.employer_subscriptions.scheduled_effective_at is
  'When scheduled_plan_slug becomes active (usually current_period_end).';
