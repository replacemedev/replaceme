import { IDS } from "../manifest.mjs";
import { isoDaysFromNow, upsertRows } from "../shared.mjs";

const now = new Date().toISOString();

export async function seedContractsAndInterviews(supabase) {
  console.log("[seed:e2e] contracts + interviews");

  await upsertRows(supabase, "contracts", [
    {
      id: IDS.contracts.starterOffered,
      employer_id: IDS.users.employerStarter,
      worker_id: IDS.users.worker1,
      job_id: IDS.jobs.starterActive1,
      status: "offered",
      employment_type: "full-time",
      hourly_rate: 22,
      weekly_hours: 40,
      start_date: isoDaysFromNow(14).slice(0, 10),
      created_at: now,
      updated_at: now,
    },
    {
      id: IDS.contracts.scaleActive,
      employer_id: IDS.users.employerScale,
      worker_id: IDS.users.worker2,
      job_id: IDS.jobs.scale1,
      status: "active",
      employment_type: "full-time",
      hourly_rate: 28,
      weekly_hours: 40,
      start_date: isoDaysFromNow(-30).slice(0, 10),
      created_at: isoDaysFromNow(-35),
      updated_at: now,
    },
  ]);

  await upsertRows(supabase, "interviews", [
    {
      id: IDS.interviews.worker2Growth,
      application_id: IDS.applications.worker2Growth,
      employer_id: IDS.users.employerGrowth,
      worker_id: IDS.users.worker2,
      job_id: IDS.jobs.growthPriority,
      status: "scheduled",
      scheduled_at: isoDaysFromNow(3),
      meeting_url: "https://meet.example.com/e2e-growth-interview",
      notes: "Growth plan technical screen",
      created_at: now,
      updated_at: now,
    },
    {
      id: IDS.interviews.worker1Starter,
      application_id: IDS.applications.worker1Starter,
      employer_id: IDS.users.employerStarter,
      worker_id: IDS.users.worker1,
      job_id: IDS.jobs.starterActive1,
      status: "scheduled",
      scheduled_at: isoDaysFromNow(2),
      meeting_url: "https://meet.example.com/e2e-starter-interview",
      notes: "Starter plan culture fit",
      created_at: now,
      updated_at: now,
    },
  ]);
}
