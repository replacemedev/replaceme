#!/usr/bin/env node
/**
 * Layer 5V prep — verify E2E fixture row counts and integrity checks.
 * Usage: npm run seed:e2e:verify
 */

import { initEnv } from "./e2e-fixtures/shared.mjs";
import { createClient } from "@supabase/supabase-js";
import { IDS, DISCOVERY_APPLICANT_WORKER_IDS } from "./e2e-fixtures/manifest.mjs";

initEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase env vars.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const THRESHOLDS = [
  ["profiles", 16],
  ["admin_profiles", 2],
  ["company_profiles", 4],
  ["billing_plans", 4],
  ["employer_subscriptions", 4],
  ["employer_plan_usage", 4],
  ["entitlement_denials", 1],
  ["jobs", 8],
  ["applications", 15],
  ["application_stage_history", 15],
  ["chat_threads", 4],
  ["chat_messages", 10],
  ["contracts", 2],
  ["interviews", 2],
  ["worker_skills", 9],
  ["worker_projects", 3],
  ["worker_saved_jobs", 3],
  ["earnings_overview", 2],
  ["worker_job_alerts", 2],
  ["skill_assessments", 1],
  ["disputes", 1],
  ["verification_documents", 2],
  ["pinned_workers", 2],
  ["employer_testimonials", 1],
  ["notifications", 9],
  ["notification_preferences", 9],
  ["faqs", 4],
  ["testimonials", 4],
  ["page_content", 3],
  ["audit_logs", 3],
];

async function countTable(table) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) throw new Error(`${table}: ${error.message}`);
  return count ?? 0;
}

async function main() {
  console.log("[verify:e2e] Table coverage\n");
  let failed = false;

  for (const [table, min] of THRESHOLDS) {
    const actual = await countTable(table);
    const ok = actual >= min;
    if (!ok) failed = true;
    console.log(
      `  ${ok ? "✓" : "✗"} ${table.padEnd(28)} ${String(actual).padStart(4)} / ${min}`
    );
  }

  const { count: discoveryApps, error: appErr } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("job_id", IDS.jobs.discoveryPending);
  if (appErr) throw appErr;

  const capOk = discoveryApps === 10;
  if (!capOk) failed = true;
  console.log(
    `\n  ${capOk ? "✓" : "✗"} Discovery job applicant cap edge: ${discoveryApps} / 10`
  );

  const { data: blockedThread, error: threadErr } = await supabase
    .from("chat_threads")
    .select("blocked_reason")
    .eq("id", IDS.threads.discoveryBlocked)
    .maybeSingle();
  if (threadErr) throw threadErr;
  const blockedOk = blockedThread?.blocked_reason === "messaging_disabled";
  if (!blockedOk) failed = true;
  console.log(
    `  ${blockedOk ? "✓" : "✗"} Discovery blocked messaging thread`
  );

  const { data: plans } = await supabase
    .from("billing_plans")
    .select("slug, price, job_post_limit, applicants_per_job_limit")
    .in("slug", ["discovery", "starter", "growth", "scale"]);

  const expected = {
    discovery: { price: 0, jobs: 1, applicants: 10 },
    starter: { price: 19, jobs: 3, applicants: 20 },
    growth: { price: 39, jobs: 10, applicants: 50 },
    scale: { price: 79, jobs: null, applicants: null },
  };

  console.log("\n[verify:e2e] Pricing tier entitlements");
  for (const plan of plans ?? []) {
    const exp = expected[plan.slug];
    const ok =
      exp &&
      Number(plan.price) === exp.price &&
      plan.job_post_limit === exp.jobs &&
      plan.applicants_per_job_limit === exp.applicants;
    if (!ok) failed = true;
    console.log(
      `  ${ok ? "✓" : "✗"} ${plan.slug} — $${plan.price}, jobs=${plan.job_post_limit}, applicants=${plan.applicants_per_job_limit}`
    );
  }

  if (failed) {
    console.error("\n[verify:e2e] FAILED — run E2E_SEED_ENABLED=1 npm run seed:e2e");
    process.exit(1);
  }

  console.log("\n[verify:e2e] All checks passed.");
}

main().catch((err) => {
  console.error("[verify:e2e] Error:", err.message ?? err);
  process.exit(1);
});
