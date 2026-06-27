import { IDS, PERSONAS } from "../manifest.mjs";
import { upsertRows } from "../shared.mjs";

const now = new Date().toISOString();

const ALL_USER_IDS = [
  ...PERSONAS.workers.map((w) => w.id),
  ...PERSONAS.employers.map((e) => e.id),
  ...PERSONAS.admins.map((a) => a.id),
];

export async function seedCmsAndComms(supabase) {
  console.log("[seed:e2e] cms + notifications");

  await upsertRows(supabase, "faqs", [
    {
      id: "ec100001-0001-4001-8001-000000000001",
      question: "What is included in the free Discovery plan?",
      answer:
        "Discovery includes 1 active job, up to 10 applicants per job, 2-day approval, and anonymous candidate previews. Messaging and resume downloads require Starter ($19/mo) or above.",
      display_order: 1,
    },
    {
      id: "ec100001-0001-4001-8001-000000000002",
      question: "How does Growth differ from Starter?",
      answer:
        "Growth ($39/mo) adds 10 active jobs, 50 applicants per job, and priority listing versus Starter's 3 jobs and 20 applicants.",
      display_order: 2,
    },
    {
      id: "ec100001-0001-4001-8001-000000000003",
      question: "Is ReplaceMe free for workers?",
      answer: "Yes — workers browse, apply, and message employers at no cost.",
      display_order: 3,
    },
    {
      id: "ec100001-0001-4001-8001-000000000004",
      question: "What does Scale include?",
      answer:
        "Scale ($79/mo) offers unlimited jobs and applicants, priority support, and early access to new features.",
      display_order: 4,
    },
  ]);

  await upsertRows(supabase, "testimonials", [
    {
      id: "ec200001-0001-4001-8001-000000000001",
      quote: "We hired our first remote engineer in a week on the Starter plan.",
      author_name: "Jordan Lee",
      author_title: "Head of Talent",
      author_company: "BrightHire Co",
      display_order: 1,
    },
    {
      id: "ec200001-0001-4001-8001-000000000002",
      quote: "Growth priority listing doubled our applicant quality.",
      author_name: "Priya Shah",
      author_title: "COO",
      author_company: "ScalePath Inc",
      display_order: 2,
    },
    {
      id: "ec200001-0001-4001-8001-000000000003",
      quote: "Scale lets us run a distributed team without friction.",
      author_name: "Marcus Webb",
      author_title: "VP Engineering",
      author_company: "Global Teams LLC",
      display_order: 3,
    },
    {
      id: "ec200001-0001-4001-8001-000000000004",
      quote: "I found a fully remote role that fits my salary expectations.",
      author_name: "Maya Chen",
      author_title: "Senior React Developer",
      author_company: "Worker",
      display_order: 4,
    },
  ]);

  await upsertRows(supabase, "page_content", [
    {
      id: "ec300001-0001-4001-8001-000000000001",
      slug: "pricing",
      title: "Pricing",
      content_type: "json",
      is_published: true,
      content_json: {
        headline: "Simple, Transparent Pricing",
        description: "Discovery is free. Upgrade when you need full profiles and messaging.",
      },
      meta: { lastUpdated: "June 2026" },
      updated_at: now,
    },
    {
      id: "ec300001-0001-4001-8001-000000000002",
      slug: "help",
      title: "Help Center",
      content_type: "json",
      is_published: true,
      content_json: { headline: "How can we help?" },
      meta: {},
      updated_at: now,
    },
    {
      id: "ec300001-0001-4001-8001-000000000003",
      slug: "home",
      title: "Home",
      content_type: "json",
      is_published: true,
      content_json: { headline: "Hire remote talent with confidence" },
      meta: {},
      updated_at: now,
    },
  ]);

  const notifications = ALL_USER_IDS.map((userId, index) => ({
    id: `ec400001-0001-4001-8001-${String(index + 1).padStart(12, "0")}`,
    user_id: userId,
    title: "E2E fixture notification",
    message: "Your account has seeded fixture data for Playwright tests.",
    type: "system",
    is_read: index % 3 === 0,
    metadata: {},
    created_at: now,
  }));

  await upsertRows(supabase, "notifications", notifications);

  const prefs = ALL_USER_IDS.map((userId) => ({
    user_id: userId,
    email_applications: true,
    email_messages: true,
    email_offers: true,
    in_app_enabled: true,
    updated_at: now,
  }));

  await upsertRows(supabase, "notification_preferences", prefs, "user_id");
}
