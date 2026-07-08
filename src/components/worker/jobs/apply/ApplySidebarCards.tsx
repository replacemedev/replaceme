import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
} from "lucide-react";
import {
  ApplyJobSummary,
  MESSAGE_GUIDE_TIPS,
  formatHoursPerWeek,
  formatMonthlySalary,
  formatPostedShort,
} from "@/types/job-application";

import { formatMoney } from "@/lib/format/currency";

interface ApplySidebarCardsProps {
  job: ApplyJobSummary;
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Briefcase;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon className="h-4 w-4 text-[#006e2f] shrink-0" aria-hidden />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>
      <span className="text-sm font-bold text-slate-900 text-right shrink-0">
        {value}
      </span>
    </div>
  );
}

export function ApplySidebarCards({ job }: ApplySidebarCardsProps) {
  const hourlyRate =
    job.monthlySalary && job.hoursPerWeek
      ? job.monthlySalary / (4.33 * job.hoursPerWeek)
      : 0;

  return (
    <aside className="space-y-5">
      <article className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <h2 className="text-base font-extrabold text-slate-900 mb-4">
          Job Summary
        </h2>

        <SummaryRow
          icon={Briefcase}
          label="Employment Type"
          value={job.employmentType}
        />
        <SummaryRow
          icon={DollarSign}
          label="Monthly Salary (USD)"
          value={formatMonthlySalary(job.monthlySalary, job.salaryCurrency)}
        />
        <SummaryRow
          icon={DollarSign}
          label={`Hourly Rate (${job.salaryCurrency})`}
          value={formatMoney(hourlyRate, job.salaryCurrency, { perHour: true, maximumFractionDigits: 2 })}
        />
        <SummaryRow
          icon={Clock}
          label="Hours per Week"
          value={formatHoursPerWeek(job.hoursPerWeek)}
        />
        <SummaryRow
          icon={Calendar}
          label="Posted"
          value={formatPostedShort(job.createdAt)}
        />
      </article>

      <article className="relative overflow-hidden bg-[#0a4a29] rounded-2xl p-5 sm:p-6 text-white">
        <header className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-[#4ade80]" aria-hidden />
          <h2 className="text-base font-extrabold">Message Guide</h2>
        </header>

        <ul className="space-y-2.5 text-sm font-medium text-white/90 list-disc pl-5">
          {MESSAGE_GUIDE_TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>

        <CheckCircle2
          className="absolute -bottom-4 -right-4 h-28 w-28 text-white/[0.06] pointer-events-none"
          aria-hidden
        />
      </article>
    </aside>
  );
}
