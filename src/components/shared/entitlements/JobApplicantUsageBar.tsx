import { UpgradeCTA } from "./UpgradeCTA";

interface JobApplicantUsageBarProps {
  visibleCount: number;
  hiddenCount?: number;
  capLimit: number | null;
  currentPlan: string;
  className?: string;
  compact?: boolean;
  showUpgrade?: boolean;
}

function usagePercent(visible: number, limit: number | null): number {
  if (limit === null || limit <= 0) return 0;
  return Math.min(100, Math.round((visible / limit) * 100));
}

function barColor(percent: number): string {
  if (percent >= 100) return "bg-red-500";
  if (percent >= 80) return "bg-amber-500";
  return "bg-[#006e2f]";
}

export function JobApplicantUsageBar({
  visibleCount,
  hiddenCount = 0,
  capLimit,
  currentPlan,
  className = "",
  compact = false,
  showUpgrade = false,
}: JobApplicantUsageBarProps) {
  if (capLimit === null) return null;

  const percent = usagePercent(visibleCount, capLimit);
  const capLabel = `${visibleCount} / ${capLimit} applicants visible`;

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white ${
        compact ? "p-3" : "p-4"
      } space-y-2 ${className}`}
      role="status"
      aria-label="Applicant cap usage for this job"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
        <span className="text-slate-600">Applicants on this job</span>
        <span className="text-slate-800 tabular-nums">
          {capLabel}
          {hiddenCount > 0 ? (
            <span className="text-amber-700 font-bold">
              {" "}
              · +{hiddenCount} hidden
            </span>
          ) : null}
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={visibleCount}
        aria-valuemin={0}
        aria-valuemax={capLimit}
      >
        <div
          className={`h-full rounded-full transition-all ${barColor(percent)}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {!compact && hiddenCount > 0 ? (
        <p className="text-[11px] font-medium leading-relaxed text-amber-800/90">
          Upgrade your plan to review every candidate who applied to this role.
        </p>
      ) : null}
      {showUpgrade && hiddenCount > 0 ? (
        <UpgradeCTA
          feature="applicant_cap"
          currentPlan={currentPlan}
          className="w-full sm:w-auto justify-center"
        />
      ) : null}
    </div>
  );
}
