import Link from "next/link";
import { Calendar } from "lucide-react";
import { LogoImage } from "@/components/shared/media/LogoImage";
import {
  WorkerApplication,
  formatHourlyRate,
  getStatusBadge,
} from "@/types/applications";

interface ApplicationRowProps {
  application: WorkerApplication;
}

const badgeStyles = {
  review: "bg-emerald-50 text-emerald-700 border-emerald-100",
  interview: "bg-blue-50 text-blue-700 border-blue-100",
  shortlisted: "bg-violet-50 text-violet-700 border-violet-100",
  declined: "bg-slate-100 text-slate-600 border-slate-200",
  hired: "bg-[#ebfdf2] text-[#006e2f] border-[#006e2f]/20",
  default: "bg-slate-100 text-slate-600 border-slate-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const avatarColors = [
  "bg-[#ebfdf2] text-[#006e2f]",
  "bg-blue-50 text-blue-700",
  "bg-violet-50 text-violet-700",
  "bg-amber-50 text-amber-700",
];

function avatarColor(name: string) {
  const code = name.charCodeAt(0) || 0;
  return avatarColors[code % avatarColors.length];
}

export function ApplicationRow({ application }: ApplicationRowProps) {
  const { label, variant } = getStatusBadge(application.status);
  const colorClass = avatarColor(application.companyName);

  return (
    <article className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-xs transition-all duration-200 hover:border-emerald-200 hover:shadow-md">
      <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
        <div className="relative shrink-0 w-11 h-11 overflow-hidden rounded-xl">
          <LogoImage
            src={application.companyLogoUrl}
            alt={`${application.companyName} logo`}
            label={application.companyName}
            sizePx={44}
            rounded="xl"
            colorClass={`flex items-center justify-center font-bold text-sm ${colorClass}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {application.jobTitle}
            </h3>
            <span
              className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badgeStyles[variant]}`}
            >
              {label}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 truncate">
            {application.companyName}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 shrink-0 pl-14 sm:pl-0">
        <div className="text-left sm:text-right">
          <p className="flex items-center sm:justify-end gap-1.5 text-xs font-medium text-slate-500">
            <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {formatDate(application.createdAt)}
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {formatHourlyRate(application.hourlyRate)}
          </p>
        </div>

        <Link
          href={`/worker/applications/${application.id}`}
          className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-[#006e2f] hover:text-[#006e2f] transition-colors shrink-0"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
