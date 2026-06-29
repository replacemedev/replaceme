import Link from "next/link";
import type { EmployerPlanUsage } from "@/lib/server/entitlements";
import { PlanTierBadge } from "./PlanTierBadge";
import { FileDown, MessageSquare, UserRound } from "lucide-react";

function formatLimit(used: number, limit: number | null): string {
  if (limit === null) return `${used} / ∞`;
  return `${used} / ${limit}`;
}

function usagePercent(used: number, limit: number | null): number {
  if (limit === null || limit <= 0) return 0;
  return (used / limit) * 100;
}

function barClass(percent: number): string {
  if (percent >= 100) return "bg-gradient-to-r from-amber-500 to-rose-500";
  if (percent >= 80) return "bg-gradient-to-r from-amber-400 to-amber-600";
  return "bg-gradient-to-r from-[#006e2f] to-emerald-500";
}

interface PlanUsageCardProps {
  usage: EmployerPlanUsage;
}

export function PlanUsageCard({ usage }: PlanUsageCardProps) {
  const jobsPercent = usagePercent(usage.activeJobsCount, usage.activeJobsLimit);
  const jobsBarWidth = Math.min(jobsPercent, 100);
  const isAtOrOverLimit = usage.activeJobsLimit !== null && jobsPercent >= 100;
  const applicantLabel =
    usage.applicantsPerJobLimit === null
      ? "Unlimited per job"
      : `Up to ${usage.applicantsPerJobLimit} per job`;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
      <div className="p-6 bg-gradient-to-br from-[#fafdfb] to-white border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-slate-900">
              Subscription
            </h3>
            <p className="text-[11px] font-semibold text-slate-500 mt-1 leading-snug">
              Billed monthly in USD
            </p>
          </div>
          <PlanTierBadge tier={usage.planSlug} size="lg" />
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-slate-700">Active job posts</p>
            <p className="text-xs font-extrabold text-slate-700">
              {formatLimit(usage.activeJobsCount, usage.activeJobsLimit)}
            </p>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all ${barClass(jobsPercent)}`}
              style={{ width: `${jobsBarWidth}%` }}
            />
          </div>
          {usage.activeJobsLimit !== null ? (
            <p
              className={`text-[11px] font-bold ${
                isAtOrOverLimit ? "text-rose-600" : jobsPercent >= 80 ? "text-amber-700" : "text-slate-500"
              }`}
            >
              {isAtOrOverLimit ? "Upgrade to post more jobs" : jobsPercent >= 80 ? "Near limit" : "Within plan limits"}
            </p>
          ) : (
            <p className="text-[11px] font-bold text-slate-500">Unlimited on your plan</p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-slate-700">Applicants per job</p>
            <p className="text-xs font-extrabold text-slate-700">
              {applicantLabel}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 text-[11px] font-bold">
          <div
            className={`flex items-center justify-between gap-3 rounded-2xl border px-3.5 py-2.5 ${
              usage.messagingEnabled
                ? "border-emerald-100 bg-[#ebfdf2] text-[#006e2f]"
                : "border-slate-100 bg-slate-50 text-slate-600"
            }`}
          >
            <span className="flex items-center gap-2 min-w-0">
              <MessageSquare className="h-4 w-4 shrink-0" aria-hidden />
              <span className="truncate">Messaging</span>
            </span>
            <span className="shrink-0">
              {usage.messagingEnabled ? "Enabled" : "Locked"}
            </span>
          </div>

          <div
            className={`flex items-center justify-between gap-3 rounded-2xl border px-3.5 py-2.5 ${
              usage.resumeDownloadEnabled
                ? "border-emerald-100 bg-[#ebfdf2] text-[#006e2f]"
                : "border-slate-100 bg-slate-50 text-slate-600"
            }`}
          >
            <span className="flex items-center gap-2 min-w-0">
              <FileDown className="h-4 w-4 shrink-0" aria-hidden />
              <span className="truncate">Resume downloads</span>
            </span>
            <span className="shrink-0">
              {usage.resumeDownloadEnabled ? "Enabled" : "Locked"}
            </span>
          </div>

          <div
            className={`flex items-center justify-between gap-3 rounded-2xl border px-3.5 py-2.5 ${
              usage.identityMode === "full"
                ? "border-emerald-100 bg-[#ebfdf2] text-[#006e2f]"
                : "border-slate-100 bg-slate-50 text-slate-600"
            }`}
          >
            <span className="flex items-center gap-2 min-w-0">
              <UserRound className="h-4 w-4 shrink-0" aria-hidden />
              <span className="truncate">Candidate profiles</span>
            </span>
            <span className="shrink-0">
              {usage.identityMode === "full" ? "Full" : "Preview"}
            </span>
          </div>
        </div>

        <div>
          {usage.planSlug === "discovery" ? (
            <Link
              href="/employer/pricing"
              className="flex min-h-[44px] w-full items-center justify-center rounded-2xl bg-[#006e2f] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#005c26]"
            >
              Upgrade plan
            </Link>
          ) : (
            <Link
              href="/employer/settings/account"
              className="flex min-h-[44px] w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-900 shadow-sm transition-colors hover:bg-slate-50 hover:border-slate-300"
            >
              Manage subscription
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
