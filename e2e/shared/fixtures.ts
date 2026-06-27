/**
 * Stable fixture UUIDs — mirrors scripts/e2e-fixtures/manifest.mjs
 * Requires: E2E_SEED_ENABLED=1 npm run seed:e2e
 */

export const FIXTURE_JOBS = {
  discoveryPending: "e4100001-0001-4001-8001-000000000001",
  starterActive1: "e4100001-0001-4001-8001-000000000002",
  starterActive2: "e4100001-0001-4001-8001-000000000003",
  growthPriority: "e4100001-0001-4001-8001-000000000004",
  scale1: "e4100001-0001-4001-8001-000000000005",
} as const;

export const FIXTURE_THREADS = {
  starterWorker1: "e6100001-0001-4001-8001-000000000001",
  growthWorker2: "e6100001-0001-4001-8001-000000000002",
  discoveryBlocked: "e6100001-0001-4001-8001-000000000003",
  scaleGeneral: "e6100001-0001-4001-8001-000000000004",
} as const;

export const FIXTURE_WORKERS = {
  maya: "e2100001-0001-4001-8001-000000000001",
  james: "e2100001-0001-4001-8001-000000000002",
  sofia: "e2100001-0001-4001-8001-000000000003",
} as const;

export function employerApplicantsPath(jobId: string) {
  return `/employer/jobs/${jobId}/applicants`;
}

export function employerMessagesPath(threadId: string) {
  return `/employer/messages?threadId=${threadId}`;
}

export function workerMessagesPath(threadId: string) {
  return `/worker/messages?threadId=${threadId}`;
}
