import { DISCOVERY_APPLICANT_WORKER_IDS, IDS } from "../manifest.mjs";
import { deleteByIds, upsertRows } from "../shared.mjs";

const now = new Date().toISOString();

function appId(index) {
  return `e5100001-0001-4001-8001-${index.toString(16).padStart(12, "0")}`;
}

function historyId(index) {
  return `e5500001-0001-4001-8001-${index.toString(16).padStart(12, "0")}`;
}

const STATUS_ROTATION = [
  "PENDING",
  "UNDER_REVIEW",
  "INTERVIEW_SCHEDULED",
  "REJECTED",
  "HIRED",
];

export async function seedApplications(supabase) {
  console.log("[seed:e2e] applications — 15+ rows + stage history");

  const legacyDiscoveryIds = Array.from({ length: 10 }, (_, i) => appId(i + 1));
  await deleteByIds(
    supabase,
    "application_stage_history",
    "application_id",
    legacyDiscoveryIds
  );
  await deleteByIds(supabase, "applications", "id", legacyDiscoveryIds);

  const applications = [];
  let history = [];
  let historyIdx = 1;

  DISCOVERY_APPLICANT_WORKER_IDS.forEach((workerId, index) => {
    const id = appId(index + 100);
    const isCapEdge = index === DISCOVERY_APPLICANT_WORKER_IDS.length - 1;
    applications.push({
      id,
      job_id: IDS.jobs.discoveryPending,
      candidate_id: workerId,
      status: "PENDING",
      match_score: 72 + index,
      is_within_plan_cap: true,
      cover_letter: isCapEdge
        ? "Cap-edge applicant (10th on Discovery job)."
        : `Discovery applicant #${index + 1}.`,
      received_at: now,
      created_at: now,
    });
    history.push({
      id: historyId(historyIdx++),
      application_id: id,
      status: "PENDING",
      actor_role: "worker",
      actor_id: workerId,
      note: "Application submitted",
      created_at: now,
    });
  });

  const featured = [
    {
      id: IDS.applications.worker1Starter,
      job_id: IDS.jobs.starterActive1,
      candidate_id: IDS.users.worker1,
      status: "INTERVIEW_SCHEDULED",
      match_score: 91,
    },
    {
      id: IDS.applications.worker1Starter2,
      job_id: IDS.jobs.starterActive2,
      candidate_id: IDS.users.worker1,
      status: "UNDER_REVIEW",
      match_score: 84,
    },
    {
      id: IDS.applications.worker2Growth,
      job_id: IDS.jobs.growthPriority,
      candidate_id: IDS.users.worker2,
      status: "INTERVIEW_SCHEDULED",
      match_score: 88,
    },
    {
      id: IDS.applications.scaleWorker2Active,
      job_id: IDS.jobs.scale1,
      candidate_id: IDS.users.worker2,
      status: "HIRED",
      match_score: 93,
    },
  ];

  for (const row of featured) {
    if (applications.some((a) => a.id === row.id)) continue;
    applications.push({
      ...row,
      is_within_plan_cap: true,
      received_at: now,
      created_at: now,
    });
    history.push(
      {
        id: historyId(historyIdx++),
        application_id: row.id,
        status: "PENDING",
        actor_role: "worker",
        actor_id: row.candidate_id,
        note: "Submitted",
        created_at: now,
      },
      {
        id: historyId(historyIdx++),
        application_id: row.id,
        status: row.status,
        actor_role: "employer",
        actor_id:
          row.job_id === IDS.jobs.growthPriority
            ? IDS.users.employerGrowth
            : row.job_id === IDS.jobs.scale1
              ? IDS.users.employerScale
              : IDS.users.employerStarter,
        note: "Employer updated pipeline stage",
        created_at: now,
      }
    );
  }

  let extraIndex = 16;
  for (const jobId of [
    IDS.jobs.scale2,
    IDS.jobs.scale3,
    IDS.jobs.scale4,
    IDS.jobs.growthPriority,
  ]) {
    const id = appId(extraIndex++);
    const workerId =
      extraIndex % 2 === 0 ? IDS.users.worker1 : IDS.users.fillerWorker4;
    applications.push({
      id,
      job_id: jobId,
      candidate_id: workerId,
      status: STATUS_ROTATION[extraIndex % STATUS_ROTATION.length],
      match_score: 70 + (extraIndex % 20),
      is_within_plan_cap: true,
      received_at: now,
      created_at: now,
    });
    history.push({
      id: historyId(historyIdx++),
      application_id: id,
      status: "PENDING",
      actor_role: "system",
      actor_id: null,
      note: "Auto-tracked",
      created_at: now,
    });
  }

  await upsertRows(supabase, "applications", applications);
  await upsertRows(supabase, "application_stage_history", history);
}
