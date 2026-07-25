import { DISCOVERY_JOB_APPROVAL_SLA } from "@/lib/data/legal";

export type DiscoverySlaTone = "ok" | "due_soon" | "overdue";

export type DiscoverySlaState = {
  tone: DiscoverySlaTone;
  hoursPending: number;
  label: string;
};

function hoursBetween(fromIso: string, nowMs: number): number {
  const start = new Date(fromIso).getTime();
  if (Number.isNaN(start)) return 0;
  return Math.max(0, (nowMs - start) / (60 * 60 * 1000));
}

/** Pending Discovery jobs only — paid instant posts never enter this path. */
export function getDiscoverySlaState(
  input: {
    status: string;
    requiresManualApproval: boolean;
    submittedForReviewAt: string | null;
  },
  nowMs: number = Date.now()
): DiscoverySlaState | null {
  if (input.status !== "Pending Review" || !input.requiresManualApproval) {
    return null;
  }
  const submittedAt = input.submittedForReviewAt;
  if (!submittedAt) return null;

  const hoursPending = hoursBetween(submittedAt, nowMs);
  const { remindAfterHours, overdueAfterHours, targetBusinessDays } =
    DISCOVERY_JOB_APPROVAL_SLA;

  if (hoursPending >= overdueAfterHours) {
    return {
      tone: "overdue",
      hoursPending,
      label: `Overdue · ${Math.floor(hoursPending)}h (SLA ${targetBusinessDays} business days)`,
    };
  }
  if (hoursPending >= remindAfterHours) {
    return {
      tone: "due_soon",
      hoursPending,
      label: `Due soon · ${Math.floor(hoursPending)}h in queue`,
    };
  }
  return {
    tone: "ok",
    hoursPending,
    label: `In queue · ${Math.floor(hoursPending)}h`,
  };
}

export function discoverySlaSortWeight(tone: DiscoverySlaTone | null): number {
  if (tone === "overdue") return 0;
  if (tone === "due_soon") return 1;
  if (tone === "ok") return 2;
  return 3;
}
