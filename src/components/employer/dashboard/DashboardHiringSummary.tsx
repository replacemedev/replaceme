import Link from "next/link";
import { Calendar, Users } from "lucide-react";
import type { EmployerInterviewRow } from "@/actions/employer/hiring";
import { EmployerSectionCard } from "@/components/employer/layout";

interface DashboardHiringSummaryProps {
  interviewCount: number;
  activeHires: number;
  upcomingInterviews: EmployerInterviewRow[];
}

function formatShortDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Scheduled";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function DashboardHiringSummary({
  interviewCount,
  activeHires,
  upcomingInterviews,
}: DashboardHiringSummaryProps) {
  return (
    <EmployerSectionCard
      title="Hiring summary"
      description="Quick view of active stages"
      action={
        <Link
          href="/employer/hired"
          className="text-xs font-bold text-[#006e2f] hover:underline"
        >
          View team
        </Link>
      }
      padded={false}
      bodyClassName=""
    >
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-100 bg-[#fafdfb] p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-slate-700">Interviews</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ebfdf2] text-[#006e2f]">
                <Calendar className="h-4 w-4" aria-hidden />
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">
              {interviewCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-[#fafdfb] p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-slate-700">Active hires</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ebfdf2] text-[#006e2f]">
                <Users className="h-4 w-4" aria-hidden />
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">
              {activeHires}
            </p>
          </div>
        </div>

        {upcomingInterviews.length > 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-100 bg-white overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-700">Next interviews</p>
              <Link
                href="/employer/interviews"
                className="text-xs font-bold text-[#006e2f] hover:underline"
              >
                View all
              </Link>
            </div>
            <ul className="divide-y divide-slate-100">
              {upcomingInterviews.slice(0, 2).map((interview) => (
                <li key={interview.applicationId} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {interview.candidateName}
                      </p>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">
                        {interview.jobTitle}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] font-bold text-slate-500">
                      {formatShortDate(interview.scheduledAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4">
            <p className="text-xs font-medium text-slate-500 leading-relaxed">
              No interviews scheduled yet.
            </p>
            <div className="mt-3 flex items-center gap-3 text-xs font-bold">
              <Link
                href="/employer/jobs"
                className="text-[#006e2f] hover:underline"
              >
                Review applicants
              </Link>
              <span className="text-slate-200">|</span>
              <Link
                href="/employer/interviews"
                className="text-[#006e2f] hover:underline"
              >
                View interviews
              </Link>
            </div>
          </div>
        )}
      </div>
    </EmployerSectionCard>
  );
}

