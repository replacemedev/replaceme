import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { EmployerPlanUsage } from "@/lib/server/entitlements";

interface DashboardWelcomeStateProps {
  planUsage: EmployerPlanUsage | null;
  compact?: boolean;
}

export function DashboardWelcomeState({
  planUsage,
  compact = false,
}: DashboardWelcomeStateProps) {
  const postHref =
    planUsage?.activeJobsLimit !== null &&
    planUsage?.activeJobsCount !== undefined &&
    planUsage?.activeJobsLimit !== undefined &&
    planUsage.activeJobsCount >= planUsage.activeJobsLimit
      ? "/employer/pricing"
      : "/employer/jobs/create";

  if (compact) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-[#fafdfb] px-6 py-5 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-slate-600">
          Ready to find more talent?
        </p>
        <Link
          href={postHref}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#006e2f] hover:text-[#005321] transition-colors shrink-0"
        >
          Post another job
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      {/* Header stripe */}
      <div className="h-1.5 bg-[#006e2f]" />

      <div className="px-8 py-10 space-y-8">
        {/* Icon + headline */}
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#ebfdf2]">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              aria-hidden="true"
            >
              <rect x="3" y="7" width="22" height="16" rx="2" stroke="#006e2f" strokeWidth="2" fill="none" />
              <path d="M10 7V5a4 4 0 0 1 8 0v2" stroke="#006e2f" strokeWidth="2" strokeLinecap="round" />
              <circle cx="14" cy="15" r="2.5" fill="#006e2f" />
              <path d="M14 17.5v2" stroke="#006e2f" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Start building your team
            </h3>
            <p className="mt-1.5 text-sm font-medium text-slate-500 leading-relaxed max-w-sm">
              Post your first job and find your perfect hire.
            </p>
          </div>
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href={postHref}
            className="group flex flex-col gap-3 rounded-2xl border border-[#006e2f]/20 bg-[#f0faf4] hover:bg-[#e6f7ed] hover:border-[#006e2f]/40 p-5 transition-all duration-200"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#006e2f] text-white">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900 group-hover:text-[#006e2f] transition-colors">
                Post a Job
              </p>
              <p className="text-xs font-medium text-slate-500 mt-0.5 leading-relaxed">
                Go live in minutes
              </p>
            </div>
          </Link>

          <Link
            href="/employer/jobs"
            className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 p-5 transition-all duration-200 min-h-[120px] [-webkit-tap-highlight-color:transparent]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-slate-200 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="2" />
                <path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900 group-hover:text-[#006e2f] transition-colors">
                Manage jobs
              </p>
              <p className="text-xs font-medium text-slate-500 mt-0.5 leading-relaxed">
                Review posts and applicants
              </p>
            </div>
          </Link>

          <Link
            href="/employer/settings/account"
            className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 p-5 transition-all duration-200"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-slate-200 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
                <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">Complete Profile</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5 leading-relaxed">
                Build trust with candidates
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
