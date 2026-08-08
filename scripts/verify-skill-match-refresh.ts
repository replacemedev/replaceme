/**
 * One-off live verification: skill-match refresh between worker & employer job.
 * Restores original skills after the run.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/verify-skill-match-refresh.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const WORKER_ID = "e2100001-0001-4001-8001-000000000001";
const JOB_ID = "4225103c-2cce-46ca-8e65-31934a2b0f65";

async function main() {
  const { createClient } = await import("@supabase/supabase-js");
  const {
    runSkillMatchForJob,
    runSkillMatchForWorker,
    scoreJobWorkerMatch,
  } = await import("../src/lib/server/matching/skill-match-outreach");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: workerBefore } = await admin
    .from("profiles")
    .select("skills, professional_title, bio")
    .eq("id", WORKER_ID)
    .single();
  const { data: jobBefore } = await admin
    .from("jobs")
    .select("title, description, skills, status, employer_id")
    .eq("id", JOB_ID)
    .single();

  if (!workerBefore || !jobBefore) throw new Error("Fixture worker/job not found");

  const originalWorkerSkills = workerBefore.skills ?? [];
  const originalJobSkills = jobBefore.skills ?? [];

  console.log("BEFORE");
  console.log("  worker skills:", originalWorkerSkills);
  console.log("  job skills:", originalJobSkills);
  console.log(
    "  computed:",
    scoreJobWorkerMatch(jobBefore, workerBefore)
  );

  const results: Record<string, unknown> = {};

  try {
    // 1) Align worker skills with job → should refresh overlap
    const alignedWorkerSkills = ["Video Editor", "TypeScript", "React"];
    await admin
      .from("profiles")
      .update({ skills: alignedWorkerSkills })
      .eq("id", WORKER_ID);

    const workerRun = await runSkillMatchForWorker(WORKER_ID);
    results.workerRun = workerRun;

    const { data: outreach1 } = await admin
      .from("skill_match_outreach")
      .select("match_score, overlapping_skills")
      .eq("job_id", JOB_ID)
      .eq("worker_id", WORKER_ID)
      .maybeSingle();

    const { data: msg1 } = await admin
      .from("chat_messages")
      .select("content, payload")
      .eq("message_kind", "system_match")
      .contains("payload", { jobId: JOB_ID })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    results.afterWorkerAlign = { outreach: outreach1, message: msg1 };

    // 2) Employer changes job skills away from worker → stale / no Quick Apply
    const shiftedJobSkills = ["Bookkeeping", "Graphic Designer"];
    await admin.from("jobs").update({ skills: shiftedJobSkills }).eq("id", JOB_ID);

    const jobRun = await runSkillMatchForJob(JOB_ID);
    results.jobRun = jobRun;

    const { data: outreach2 } = await admin
      .from("skill_match_outreach")
      .select("match_score, overlapping_skills")
      .eq("job_id", JOB_ID)
      .eq("worker_id", WORKER_ID)
      .maybeSingle();

    const { data: msg2 } = await admin
      .from("chat_messages")
      .select("content, payload")
      .eq("message_kind", "system_match")
      .contains("payload", { jobId: JOB_ID })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    results.afterJobShift = { outreach: outreach2, message: msg2 };

    // 3) Employer restores overlapping skill → Quick Apply should return
    const restoredJobSkills = ["Video Editor", "Web Developer"];
    await admin.from("jobs").update({ skills: restoredJobSkills }).eq("id", JOB_ID);
    const jobRun2 = await runSkillMatchForJob(JOB_ID);
    results.jobRun2 = jobRun2;

    const { data: outreach3 } = await admin
      .from("skill_match_outreach")
      .select("match_score, overlapping_skills")
      .eq("job_id", JOB_ID)
      .eq("worker_id", WORKER_ID)
      .maybeSingle();

    const { data: msg3 } = await admin
      .from("chat_messages")
      .select("content, payload")
      .eq("message_kind", "system_match")
      .contains("payload", { jobId: JOB_ID })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    results.afterJobRestore = { outreach: outreach3, message: msg3 };

    const passAlign =
      Array.isArray(outreach1?.overlapping_skills) &&
      outreach1!.overlapping_skills.includes("Video Editor") &&
      (msg1?.payload as { cta?: string } | null)?.cta === "quick_apply";

    const passStale =
      Array.isArray(outreach2?.overlapping_skills) &&
      outreach2!.overlapping_skills.length === 0 &&
      (msg2?.payload as { cta?: string } | null)?.cta !== "quick_apply";

    const passRestore =
      Array.isArray(outreach3?.overlapping_skills) &&
      outreach3!.overlapping_skills.includes("Video Editor") &&
      (msg3?.payload as { cta?: string } | null)?.cta === "quick_apply";

    console.log("\nRESULTS");
    console.log(JSON.stringify(results, null, 2));
    console.log("\nCHECKS");
    console.log("  worker skill align → Video Editor + Quick Apply:", passAlign ? "PASS" : "FAIL");
    console.log("  employer skill shift → no overlap / no CTA:", passStale ? "PASS" : "FAIL");
    console.log("  employer skill restore → Video Editor + Quick Apply:", passRestore ? "PASS" : "FAIL");

    if (!passAlign || !passStale || !passRestore) {
      process.exitCode = 1;
    } else {
      console.log("\nOK: worker↔employer skill-match refresh works.");
    }
  } finally {
    await admin.from("profiles").update({ skills: originalWorkerSkills }).eq("id", WORKER_ID);
    await admin.from("jobs").update({ skills: originalJobSkills }).eq("id", JOB_ID);
    // Leave match card consistent with restored skills
    await runSkillMatchForJob(JOB_ID);
    console.log("\nRestored original worker/job skills.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
