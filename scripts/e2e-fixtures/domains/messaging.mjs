import { IDS } from "../manifest.mjs";
import { isoDaysFromNow, upsertRows } from "../shared.mjs";

const now = new Date().toISOString();

export async function seedMessaging(supabase) {
  console.log("[seed:e2e] messaging — threads + messages");

  const threads = [
    {
      id: IDS.threads.starterWorker1,
      worker_id: IDS.users.worker1,
      company_profile_id: IDS.companies.brightHire,
      job_id: IDS.jobs.starterActive1,
      is_pinned: true,
      blocked_reason: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: IDS.threads.growthWorker2,
      worker_id: IDS.users.worker2,
      company_profile_id: IDS.companies.scalePath,
      job_id: IDS.jobs.growthPriority,
      is_pinned: false,
      blocked_reason: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: IDS.threads.discoveryBlocked,
      worker_id: IDS.users.worker3,
      company_profile_id: IDS.companies.novaLabs,
      job_id: IDS.jobs.discoveryPending,
      is_pinned: false,
      blocked_reason: "messaging_disabled",
      created_at: now,
      updated_at: now,
    },
    {
      id: IDS.threads.scaleGeneral,
      worker_id: IDS.users.worker1,
      company_profile_id: IDS.companies.globalTeams,
      job_id: IDS.jobs.scale1,
      is_pinned: false,
      blocked_reason: null,
      created_at: now,
      updated_at: now,
    },
  ];

  await upsertRows(supabase, "chat_threads", threads);

  const messages = [
    {
      id: "e6200001-0001-4001-8001-000000000001",
      thread_id: IDS.threads.starterWorker1,
      sender_id: IDS.users.employerStarter,
      content: "Hi Maya — thanks for applying. Are you available for a intro call this week?",
      created_at: isoDaysFromNow(-2),
      read_at: isoDaysFromNow(-1),
    },
    {
      id: "e6200001-0001-4001-8001-000000000002",
      thread_id: IDS.threads.starterWorker1,
      sender_id: IDS.users.worker1,
      content: "Absolutely! I'm free Tuesday or Wednesday afternoon PST.",
      created_at: isoDaysFromNow(-1),
      read_at: now,
    },
    {
      id: "e6200001-0001-4001-8001-000000000003",
      thread_id: IDS.threads.starterWorker1,
      sender_id: IDS.users.employerStarter,
      content: "Perfect — I'll send a calendar invite for Wednesday 2pm.",
      created_at: now,
      read_at: null,
    },
    {
      id: "e6200001-0001-4001-8001-000000000004",
      thread_id: IDS.threads.growthWorker2,
      sender_id: IDS.users.employerGrowth,
      content: "James, your profile looks strong for our full-stack role.",
      created_at: isoDaysFromNow(-1),
      read_at: now,
    },
    {
      id: "e6200001-0001-4001-8001-000000000005",
      thread_id: IDS.threads.growthWorker2,
      sender_id: IDS.users.worker2,
      content: "Thank you! Happy to walk through my recent Node projects.",
      created_at: now,
      read_at: null,
    },
    {
      id: "e6200001-0001-4001-8001-000000000006",
      thread_id: IDS.threads.discoveryBlocked,
      sender_id: IDS.users.worker3,
      content: "Hello — I applied to your VA role and wanted to follow up.",
      created_at: isoDaysFromNow(-1),
      read_at: now,
    },
    {
      id: "e6200001-0001-4001-8001-000000000007",
      thread_id: IDS.threads.scaleGeneral,
      sender_id: IDS.users.employerScale,
      content: "Welcome to Global Teams — let's discuss next steps on the engineering manager role.",
      created_at: isoDaysFromNow(-3),
      read_at: isoDaysFromNow(-2),
    },
    {
      id: "e6200001-0001-4001-8001-000000000008",
      thread_id: IDS.threads.scaleGeneral,
      sender_id: IDS.users.worker1,
      content: "Sounds great. I can share references from my last remote team.",
      created_at: isoDaysFromNow(-2),
      read_at: now,
    },
    {
      id: "e6200001-0001-4001-8001-000000000009",
      thread_id: IDS.threads.starterWorker1,
      sender_id: IDS.users.worker1,
      content: "Looking forward to it!",
      created_at: now,
      read_at: null,
    },
    {
      id: "e6200001-0001-4001-8001-00000000000a",
      thread_id: IDS.threads.growthWorker2,
      sender_id: IDS.users.employerGrowth,
      content: "Let's schedule the technical interview for next week.",
      created_at: now,
      read_at: null,
    },
  ];

  await upsertRows(supabase, "chat_messages", messages);
}
