import Link from "next/link";
import type { EmployerPlanUsage } from "@/lib/server/entitlements";
import { PlanTierBadge } from "@/components/shared/billing/PlanTierBadge";

function usagePercent(used: number, limit: number | null): number {
  if (limit === null || limit <= 0) return 0;
  return Math.min((used / limit) * 100, 100);
}

function barColor(percent: number): string {
  if (percent >= 100) return "bg-red-500";
  if (percent >= 80) return "bg-amber-500";
  return "bg-[#006e2f]";
}

interface PlanUsageStripProps {
  usage: EmployerPlanUsage;
  className?: string;
  compact?: boolean;
}

export function PlanUsageStrip({
  usage,
  className = "",
  compact = false,
}: PlanUsageStripProps) {
  const jobsPercent = usagePercent(
    usage.activeJobsCount,
    usage.activeJobsLimit
  );
  const jobsLabel =
    usage.activeJobsLimit === null
      ? `${usage.activeJobsCount} jobs`
      : `${usage.activeJobsCount} / ${usage.activeJobsLimit} jobs`;

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white ${
        compact ? "px-3 py-2 sm:flex-row sm:items-center" : "px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      } ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <PlanTierBadge tier={usage.planSlug} />
        {!compact ? (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Billed monthly in USD
          </span>
        ) : null}
      </div>

      <div
        className={`flex min-w-0 flex-1 flex-col gap-1.5 ${
          compact ? "sm:max-w-[200px]" : "sm:max-w-xs"
        }`}
      >
        <div className="flex justify-between text-[11px] font-semibold text-slate-600">
          <span>Active jobs</span>
          <span>{jobsLabel}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all ${barColor(jobsPercent)}`}
            style={{ width: `${jobsPercent}%` }}
          />
        </div>
      </div>

      <Link
        href={
          usage.planSlug === "discovery"
            ? "/employer/pricing"
            : "/employer/settings/account"
        }
        className="shrink-0 text-xs font-bold text-[#006e2f] hover:underline"
      >
        {usage.planSlug === "discovery" ? "Upgrade plan" : "Manage plan"}
      </Link>
    </div>
  );
}
