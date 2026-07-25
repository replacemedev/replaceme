/**
 * Lightweight self-check for Discovery SLA helpers (no test runner).
 * Run: npx tsx src/lib/jobs/moderation-sla.selfcheck.ts
 */
import {
  discoverySlaSortWeight,
  getDiscoverySlaState,
} from "./moderation-sla";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const now = Date.parse("2026-07-26T12:00:00.000Z");

const paid = getDiscoverySlaState(
  {
    status: "Active",
    requiresManualApproval: false,
    submittedForReviewAt: "2026-07-20T12:00:00.000Z",
  },
  now
);
assert(paid === null, "paid / active must skip SLA");

const fresh = getDiscoverySlaState(
  {
    status: "Pending Review",
    requiresManualApproval: true,
    submittedForReviewAt: "2026-07-26T06:00:00.000Z",
  },
  now
);
assert(fresh?.tone === "ok", "fresh pending should be ok");

const dueSoon = getDiscoverySlaState(
  {
    status: "Pending Review",
    requiresManualApproval: true,
    submittedForReviewAt: "2026-07-25T00:00:00.000Z",
  },
  now
);
assert(dueSoon?.tone === "due_soon", "24h+ should be due_soon");

const overdue = getDiscoverySlaState(
  {
    status: "Pending Review",
    requiresManualApproval: true,
    submittedForReviewAt: "2026-07-23T12:00:00.000Z",
  },
  now
);
assert(overdue?.tone === "overdue", "48h+ should be overdue");

assert(
  discoverySlaSortWeight("overdue") < discoverySlaSortWeight("due_soon"),
  "overdue sorts before due_soon"
);

console.log("moderation-sla.selfcheck: ok");
