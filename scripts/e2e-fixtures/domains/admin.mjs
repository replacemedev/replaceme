import { IDS } from "../manifest.mjs";
import { upsertRows } from "../shared.mjs";

const now = new Date().toISOString();

export async function seedAdminExtras(supabase) {
  console.log("[seed:e2e] admin — disputes, audit logs, pins, testimonials");

  await upsertRows(supabase, "disputes", [
    {
      id: IDS.disputes.worker3Discovery,
      worker_id: IDS.users.worker3,
      employer_id: IDS.users.employerDiscovery,
      job_id: IDS.jobs.discoveryPending,
      title: "Delayed review on Discovery job post",
      description:
        "Worker reports the Discovery-tier job remained in review beyond the stated 2-day window.",
      status: "under_review",
      created_at: now,
      updated_at: now,
    },
  ]);

  await upsertRows(supabase, "audit_logs", [
    {
      id: "ea100001-0001-4001-8001-000000000001",
      admin_id: IDS.users.admin,
      action_type: "job.approve",
      target_type: "job",
      target_id: IDS.jobs.starterActive1,
      metadata: { note: "E2E moderation audit entry" },
      created_at: now,
    },
    {
      id: "ea100001-0001-4001-8001-000000000002",
      admin_id: IDS.users.admin,
      action_type: "identity.review",
      target_type: "profile",
      target_id: IDS.users.worker3,
      metadata: { status: "documents_submitted" },
      created_at: now,
    },
    {
      id: "ea100001-0001-4001-8001-000000000003",
      admin_id: IDS.users.superadmin,
      action_type: "billing.override",
      target_type: "employer_subscription",
      target_id: IDS.subscriptions.scale,
      metadata: { override_plan: "growth" },
      created_at: now,
    },
  ]);

  await upsertRows(supabase, "pinned_workers", [
    {
      id: "ea200001-0001-4001-8001-000000000001",
      employer_id: IDS.users.employerGrowth,
      worker_id: IDS.users.worker2,
      pinned_at: now,
    },
    {
      id: "ea200001-0001-4001-8001-000000000002",
      employer_id: IDS.users.employerStarter,
      worker_id: IDS.users.worker1,
      pinned_at: now,
    },
  ]);

  await upsertRows(supabase, "employer_testimonials", [
    {
      id: "ea300001-0001-4001-8001-000000000001",
      employer_id: IDS.users.employerStarter,
      worker_id: IDS.users.worker1,
      rating: 5,
      review_text:
        "Maya delivered excellent React work on our Starter plan hire — highly recommend.",
      created_at: now,
    },
  ]);
}
