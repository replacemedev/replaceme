#!/usr/bin/env node
/**
 * Layer 5B — Full E2E fixture seed (9 personas + relational graph).
 *
 * Requires: E2E_SEED_ENABLED=1, SUPABASE_SERVICE_ROLE_KEY, persona passwords in .env.local
 * Usage:    E2E_SEED_ENABLED=1 npm run seed:e2e
 */

import {
  assertNotProduction,
  assertSeedEnabled,
  createServiceClient,
  fetchPlanIdsBySlug,
  initEnv,
} from "./e2e-fixtures/shared.mjs";
import { seedAuth } from "./e2e-fixtures/domains/auth.mjs";
import { seedProfiles } from "./e2e-fixtures/domains/profiles.mjs";
import { seedBilling } from "./e2e-fixtures/domains/billing.mjs";
import { seedJobs } from "./e2e-fixtures/domains/jobs.mjs";
import { seedApplications } from "./e2e-fixtures/domains/applications.mjs";
import { seedMessaging } from "./e2e-fixtures/domains/messaging.mjs";
import { seedContractsAndInterviews } from "./e2e-fixtures/domains/contracts.mjs";
import { seedWorkerExtras } from "./e2e-fixtures/domains/worker.mjs";
import { seedAdminExtras } from "./e2e-fixtures/domains/admin.mjs";
import { seedCmsAndComms } from "./e2e-fixtures/domains/cms.mjs";
import { PERSONAS } from "./e2e-fixtures/manifest.mjs";

initEnv();
assertSeedEnabled();
assertNotProduction();

const supabase = createServiceClient();

const ctx = {
  userIds: {},
  planIds: {},
  companies: {},
  jobIds: {},
};

async function main() {
  console.log("[seed:e2e] Starting full fixture seed (pricing v2 tiers)…");
  console.log(
    "  Tiers: Discovery $0 · Starter $19 · Growth $39 · Scale $79"
  );

  ctx.planIds = await fetchPlanIdsBySlug(supabase);

  await seedAuth(supabase, ctx);
  await seedProfiles(supabase, ctx);
  await seedBilling(supabase, ctx);
  await seedJobs(supabase, ctx);
  await seedApplications(supabase);
  await seedMessaging(supabase);
  await seedContractsAndInterviews(supabase);
  await seedWorkerExtras(supabase);
  await seedAdminExtras(supabase);
  await seedCmsAndComms(supabase);

  console.log("\n[seed:e2e] Done. Personas:");
  for (const w of PERSONAS.workers) console.log(`  worker   ${w.email}`);
  for (const e of PERSONAS.employers)
    console.log(`  employer ${e.email} (${e.planSlug})`);
  for (const a of PERSONAS.admins) console.log(`  admin    ${a.email}`);
  console.log("\nRun: npm run seed:e2e:verify");
}

main().catch((err) => {
  console.error("[seed:e2e] Failed:", err.message ?? err);
  process.exit(1);
});
