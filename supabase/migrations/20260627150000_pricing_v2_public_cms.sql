-- Pricing v2: replace legacy $30/Standard Plan FAQ copy with four-tier messaging.

DELETE FROM public.faqs;

INSERT INTO public.faqs (id, question, answer, display_order) VALUES
  (
    'a1000001-0001-4001-8001-000000000001',
    'What is included in the free Discovery plan?',
    'Discovery ($0/mo) includes 1 active job post, up to 10 applicants per job, 2-day job approval, and anonymous candidate previews (skills, experience, and salary visible; names, contact details, and resumes locked). Messaging and resume downloads require Starter ($19/mo) or above.',
    1
  ),
  (
    'a1000001-0001-4001-8001-000000000002',
    'How do Starter, Growth, and Scale compare?',
    'Starter ($19/mo): 3 jobs, 20 applicants per job, full profiles, messaging, and instant approval. Growth ($39/mo, most popular): 10 jobs, 50 applicants per job, and priority listing. Scale ($79/mo): unlimited jobs and applicants, priority support, and early access.',
    2
  ),
  (
    'a1000001-0001-4001-8001-000000000003',
    'Is Replace Me free for job seekers?',
    'Yes. Workers browse jobs, apply, and message employers at no cost.',
    3
  ),
  (
    'a1000001-0001-4001-8001-000000000004',
    'Can I cancel my employer subscription?',
    'Yes. You can cancel anytime from Account Settings or the Stripe billing portal. Your plan stays active until the end of the billing period, then you return to Discovery.',
    4
  ),
  (
    'a1000001-0001-4001-8001-000000000005',
    'What is the refund policy?',
    'Paid subscriptions include a 30-day money-back guarantee. Contact support if you are not satisfied within 30 days of your first charge on a paid tier.',
    5
  )
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  answer = EXCLUDED.answer,
  display_order = EXCLUDED.display_order;

INSERT INTO public.page_content (slug, title, content_type, is_published, content_json, meta, updated_at)
VALUES (
  'pricing',
  'Pricing',
  'json',
  true,
  jsonb_build_object(
    'headline', 'Simple, Transparent Pricing',
    'description', 'Discovery is free. Choose Starter ($19), Growth ($39), or Scale ($79) when you need full profiles, messaging, and instant approval.'
  ),
  jsonb_build_object('lastUpdated', 'June 2026'),
  timezone('utc'::text, now())
)
ON CONFLICT (slug) DO UPDATE SET
  content_json = EXCLUDED.content_json,
  meta = EXCLUDED.meta,
  is_published = true,
  updated_at = EXCLUDED.updated_at;
