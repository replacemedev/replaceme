import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { formatMoney } from "@/lib/format/currency";
import type { AdminJobDeepDive } from "@/actions/admin/deep-dive";

interface JobDeepDiveViewProps {
  data: AdminJobDeepDive;
}

export function JobDeepDiveView({ data }: JobDeepDiveViewProps) {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to job moderation
      </Link>

      <header className="space-y-2">
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{data.title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={data.status} />
          <span className="text-sm text-slate-500">{data.employmentType}</span>
          <span className="text-sm font-mono text-slate-600">
            {formatMoney(data.monthlySalary, data.salaryCurrency)}/mo
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Employer
          </p>
          <Link
            href={`/admin/users/employers/${data.employerId}`}
            className="mt-1 block text-sm font-bold text-emerald-700 hover:underline"
          >
            {data.companyName ?? "View employer"}
          </Link>
          <p className="mt-1 text-xs text-slate-500">{data.location ?? "—"}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Schedule
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {data.hoursPerWeek} hrs/week
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Posted {new Date(data.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {data.skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-600"
            >
              {skill}
            </span>
          ))}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Description
        </p>
        <pre className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{data.description}</pre>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Responsibilities
          </p>
          <ul className="mt-2 space-y-2 text-sm text-slate-700">
            {data.parsedSections.responsibilities.length > 0 ? (
              data.parsedSections.responsibilities.map((item) => (
                <li key={item} className="leading-relaxed">
                  - {item}
                </li>
              ))
            ) : (
              <li className="text-slate-500">—</li>
            )}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Requirements
          </p>
          <ul className="mt-2 space-y-2 text-sm text-slate-700">
            {data.parsedSections.requirements.length > 0 ? (
              data.parsedSections.requirements.map((item) => (
                <li key={item} className="leading-relaxed">
                  - {item}
                </li>
              ))
            ) : (
              <li className="text-slate-500">—</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
