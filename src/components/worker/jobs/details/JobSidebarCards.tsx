import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  DollarSign,
} from "lucide-react";
import {
  WorkerJobDetails,
  formatMemberSince,
  formatPostedDate,
  formatCompensation,
} from "@/types/job-details";

interface JobSidebarCardsProps {
  job: WorkerJobDetails;
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Briefcase;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <Icon className="h-4 w-4 text-[#006e2f] mt-0.5 shrink-0" aria-hidden />
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="text-sm font-bold text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export function JobSidebarCards({ job }: JobSidebarCardsProps) {
  return (
    <aside className="space-y-5">
      <article className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <header className="flex items-center gap-2 pb-4 mb-2 border-b border-slate-100">
          <Briefcase className="h-5 w-5 text-[#006e2f]" aria-hidden />
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
            Job Details
          </h2>
        </header>

        <DetailRow
          icon={Briefcase}
          label="Type of Work"
          value={job.employmentType}
        />
        <DetailRow
          icon={DollarSign}
          label="Wage / Salary"
          value={formatCompensation(job.monthlySalary, job.salaryCurrency)}
        />
        <DetailRow
          icon={Clock}
          label="Hours per Week"
          value={String(job.hoursPerWeek)}
        />
        <DetailRow
          icon={Calendar}
          label="Date Updated"
          value={formatPostedDate(job.updatedAt)}
        />
      </article>

      <article className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <header className="flex items-center gap-2 pb-4 mb-2 border-b border-slate-100">
          <Building2 className="h-5 w-5 text-[#006e2f]" aria-hidden />
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
            Employer Info
          </h2>
        </header>

        <div className="space-y-4 py-1">
          <div className="border-b border-slate-100 pb-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Company Name
            </p>
            <p className="mt-1 text-sm font-extrabold text-[#006e2f] uppercase tracking-wide">
              {job.company.companyName}
            </p>
          </div>

          <div className="border-b border-slate-100 pb-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Member since
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {formatMemberSince(job.company.memberSince)}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Job Posts
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {job.company.activeJobPostsCount} Active Posts
            </p>
          </div>
        </div>
      </article>
    </aside>
  );
}
