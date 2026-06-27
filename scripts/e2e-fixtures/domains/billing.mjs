import { IDS, PERSONAS } from "../manifest.mjs";
import { isoDaysFromNow, upsertRows } from "../shared.mjs";

const periodEnd = isoDaysFromNow(30);
const periodStart = isoDaysFromNow(-1);

export async function seedBilling(supabase, ctx) {
  console.log("[seed:e2e] billing — subscriptions, usage, denials");

  const subscriptions = PERSONAS.employers.map((e) => ({
    id: IDS.subscriptions[e.planSlug],
    employer_id: e.id,
    plan_id: ctx.planIds[e.planSlug],
    plan_slug: e.planSlug,
    status: e.planSlug === "discovery" ? "active" : "active",
    job_posts_used:
      e.planSlug === "discovery"
        ? 1
        : e.planSlug === "starter"
          ? 2
          : e.planSlug === "growth"
            ? 3
            : 5,
    unlocks_used: 0,
    billing_period_start: periodStart,
    billing_period_end: periodEnd,
    current_period_end: periodEnd,
    cancel_at_period_end: false,
    updated_at: new Date().toISOString(),
  }));

  await upsertRows(supabase, "employer_subscriptions", subscriptions);

  const { error: clearOverrideError } = await supabase
    .from("employer_subscriptions")
    .update({
      override_plan_id: null,
      override_expires_at: null,
      override_reason: null,
      override_by: null,
    })
    .eq("employer_id", IDS.users.employerScale);
  if (clearOverrideError) {
    throw new Error(
      `employer_subscriptions override clear failed: ${clearOverrideError.message}`
    );
  }

  const usage = PERSONAS.employers.map((e) => ({
    employer_id: e.id,
    active_jobs_count:
      e.planSlug === "discovery"
        ? 1
        : e.planSlug === "starter"
          ? 2
          : e.planSlug === "growth"
            ? 1
            : 4,
    period_applicants_received:
      e.planSlug === "discovery" ? 10 : e.planSlug === "growth" ? 32 : 5,
    period_messages_sent: e.planSlug === "discovery" ? 0 : 12,
    computed_at: new Date().toISOString(),
  }));

  await upsertRows(supabase, "employer_plan_usage", usage, "employer_id");

  await upsertRows(supabase, "entitlement_denials", [
    {
      id: IDS.denials.jobLimit,
      employer_id: IDS.users.employerDiscovery,
      denial_type: "job_limit",
      plan_slug: "discovery",
      metadata: { active_jobs: 1, limit: 1 },
      created_at: new Date().toISOString(),
    },
    {
      id: IDS.denials.messaging,
      employer_id: IDS.users.employerDiscovery,
      denial_type: "messaging",
      plan_slug: "discovery",
      resource_id: IDS.threads.discoveryBlocked,
      metadata: { reason: "messaging_disabled" },
      created_at: new Date().toISOString(),
    },
  ]);
}
