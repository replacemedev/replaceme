import Link from "next/link";
import { Users } from "lucide-react";
import { EmployerSectionCard } from "@/components/employer/layout";

interface DashboardHiringSummaryProps {
  activeHires: number;
}

export function DashboardHiringSummary({
  activeHires,
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
          <p className="mt-1 text-[11px] font-medium text-slate-500">Current contracts</p>
        </div>

        <div className="mt-4 flex items-center gap-3 text-xs font-bold">
          <Link
            href="/employer/jobs"
            className="text-[#006e2f] hover:underline"
          >
            Review applicants
          </Link>
          <span className="text-slate-200">|</span>
          <Link
            href="/employer/hired"
            className="text-[#006e2f] hover:underline"
          >
            View hires
          </Link>
        </div>
      </div>
    </EmployerSectionCard>
  );
}
