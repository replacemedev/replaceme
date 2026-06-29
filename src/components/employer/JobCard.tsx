import React from "react";
import Link from "next/link";
import { Eye, Sparkles, Users } from "lucide-react";
import { JobPost } from "@/types/employer";
import { ApprovalStatusBadge } from "@/components/shared/entitlements/ApprovalStatusBadge";
import { isApplicantCapNear } from "@/lib/entitlements/limits";

interface JobCardProps {
  job: JobPost;
  applicantsPerJobLimit?: number | null;
}

export function JobCard({
  job,
  applicantsPerJobLimit = null,
}: JobCardProps) {
  const isPriorityListing = (job.priority_score ?? 0) > 0;
  const formattedDate = new Date(job.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const visibleCount = job.visible_applicants_count ?? job.applicants_count;
  const hiddenCount = Math.max(0, job.applicants_count - visibleCount);

  const nearApplicantCap = isApplicantCapNear(
    visibleCount,
    applicantsPerJobLimit
  );

  return (
    <div className="group relative flex flex-col gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#006e2f] via-emerald-500 to-[#006e2f] opacity-70 group-hover:opacity-100 transition-opacity" />

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <ApprovalStatusBadge status={job.status} />
          <span className="inline-flex items-center rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-500">
            {formattedDate}
          </span>
          {isPriorityListing ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-violet-700 shadow-sm">
              <Sparkles className="h-3 w-3" aria-hidden />
              Priority
            </span>
          ) : null}
        </div>

        <Link
          href={`/employer/jobs/${job.id}`}
          className="block text-xl font-extrabold text-slate-900 leading-snug tracking-tight transition-colors hover:text-[#006e2f]"
        >
          {job.title}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 select-none">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              Applicants
            </p>
            <p className="mt-1 text-lg font-extrabold text-slate-900 tracking-tight">
              {visibleCount}
              {applicantsPerJobLimit !== null ? (
                <span className="text-xs font-bold text-slate-500 ml-1">
                  / {applicantsPerJobLimit}
                </span>
              ) : null}
            </p>
            {hiddenCount > 0 ? (
              <p className="text-[10px] font-bold text-amber-700 mt-0.5">
                +{hiddenCount} hidden
              </p>
            ) : null}
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 border border-slate-100">
            <Users className="h-4 w-4" aria-hidden />
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              Views
            </p>
            <p className="mt-1 text-lg font-extrabold text-slate-900 tracking-tight">
              {job.hits_count}
            </p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 border border-slate-100">
            <Eye className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </div>

      {nearApplicantCap ? (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
          <p className="text-[11px] font-bold text-amber-800">
            Near applicant limit
          </p>
          <p className="text-[11px] font-medium text-amber-800/80 mt-0.5 leading-snug">
            Upgrade to keep receiving applicants on this job.
          </p>
        </div>
      ) : null}

      <div className="flex items-center gap-2 pt-1 text-xs font-bold text-slate-500 select-none">
        <Link
          href={`/employer/jobs/${job.id}`}
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          View job
        </Link>
        <Link
          href={`/employer/jobs/${job.id}/applicants`}
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#006e2f] px-3.5 py-2 text-xs font-extrabold text-white transition-colors hover:bg-[#005c26]"
        >
          View applicants
        </Link>
      </div>
    </div>
  );
}
