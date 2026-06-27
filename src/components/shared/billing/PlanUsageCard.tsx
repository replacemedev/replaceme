import Link from "next/link";
import type { EmployerPlanUsage } from "@/lib/server/entitlements";
import { PlanTierBadge } from "./PlanTierBadge";

function formatLimit(used: number, limit: number | null): string {
  if (limit === null) return `${used} / ∞`;
  return `${used} / ${limit}`;
}

function usagePercent(used: number, limit: number | null): number {
  if (limit === null || limit <= 0) return 0;
  return Math.min((used / limit) * 100, 100);
}

function barColor(percent: number): string {
  if (percent >= 100) return "bg-red-500";
  if (percent >= 80) return "bg-amber-500";
  return "bg-[#006e2f]";
}

interface PlanUsageCardProps {
  usage: EmployerPlanUsage;
}

export function PlanUsageCard({ usage }: PlanUsageCardProps) {
  const jobsPercent = usagePercent(usage.activeJobsCount, usage.activeJobsLimit);
  const applicantLabel =
    usage.applicantsPerJobLimit === null
      ? "Unlimited per job"
      : `Up to ${usage.applicantsPerJobLimit} per job`;

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Subscription Benefits & Usage
          </h3>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mt-0.5">
            Billed monthly in USD
          </p>
        </div>
        <PlanTierBadge tier={usage.planSlug} />
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold text-slate-600">
          <span>Active Job Posts</span>
          <span>{formatLimit(usage.activeJobsCount, usage.activeJobsLimit)}</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor(jobsPercent)}`}
            style={{ width: `${jobsPercent}%` }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold text-slate-600">
          <span>Applicants per Job</span>
          <span>{applicantLabel}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
        <span
          className={`rounded-full px-2.5 py-1 ${
            usage.messagingEnabled
              ? "bg-[#ebfdf2] text-[#006e2f]"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          Messaging: {usage.messagingEnabled ? "Enabled" : "Upgrade to message"}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 ${
            usage.resumeDownloadEnabled
              ? "bg-[#ebfdf2] text-[#006e2f]"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          Resumes: {usage.resumeDownloadEnabled ? "Enabled" : "Locked"}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 ${
            usage.identityMode === "full"
              ? "bg-[#ebfdf2] text-[#006e2f]"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          Profiles: {usage.identityMode === "full" ? "Full" : "Preview only"}
        </span>
      </div>

      {usage.planSlug === "discovery" ? (
        <Link
          href="/employer/pricing"
          className="inline-flex text-xs font-bold text-[#006e2f] hover:underline"
        >
          Upgrade for full profiles, messaging & instant approval →
        </Link>
      ) : (
        <Link
          href="/employer/settings/account"
          className="inline-flex text-xs font-bold text-[#006e2f] hover:underline"
        >
          Manage subscription →
        </Link>
      )}
    </div>
  );
}
