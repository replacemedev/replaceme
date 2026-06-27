import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { JobPost } from "@/types/employer";
import { ApprovalStatusBadge } from "@/components/shared/entitlements/ApprovalStatusBadge";
import { isApplicantCapNear } from "@/lib/entitlements/limits";

interface JobCardProps {
  job: JobPost;
  showPriorityBadge?: boolean;
  applicantsPerJobLimit?: number | null;
}

export function JobCard({
  job,
  showPriorityBadge = false,
  applicantsPerJobLimit = null,
}: JobCardProps) {
  const formattedDate = new Date(job.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const nearApplicantCap = isApplicantCapNear(
    job.applicants_count,
    applicantsPerJobLimit
  );

  return (
    <div className="group flex flex-col justify-between p-6 bg-white border border-slate-200 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-300 gap-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#006e2f] transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300" />

      {showPriorityBadge ? (
        <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-violet-700">
          <Sparkles className="h-3 w-3" aria-hidden />
          Priority
        </div>
      ) : null}

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 pr-20">
          <ApprovalStatusBadge status={job.status} />
          <span className="text-xs text-slate-400 font-medium shrink-0">
            {formattedDate}
          </span>
        </div>

        <Link
          href={`/employer/jobs/${job.id}`}
          className="block text-lg font-bold text-[#006e2f] hover:text-[#005321] hover:underline leading-snug tracking-tight transition-colors"
        >
          {job.title}
        </Link>
      </div>

      <div className="flex items-center gap-6 text-sm py-1 border-y border-slate-50 select-none">
        <span className="text-slate-500 font-medium">
          <strong className="text-slate-900 font-extrabold text-base mr-1">
            {job.applicants_count}
            {applicantsPerJobLimit !== null
              ? ` / ${applicantsPerJobLimit}`
              : ""}
          </strong>
          Applicants
        </span>
        <span className="text-slate-500 font-medium">
          <strong className="text-slate-900 font-extrabold text-base mr-1">
            {job.hits_count}
          </strong>
          Views
        </span>
      </div>

      {nearApplicantCap ? (
        <p className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5">
          Approaching applicant cap for this job
        </p>
      ) : null}

      <div className="flex items-center gap-3 pt-1 text-xs font-bold text-slate-400 select-none">
        <Link
          href={`/employer/jobs/${job.id}`}
          className="text-[#006e2f] hover:text-[#005321] transition-colors uppercase hover:underline"
        >
          View
        </Link>
        <span className="text-slate-200">|</span>
        <Link
          href={`/employer/jobs/${job.id}/applicants`}
          className="text-[#006e2f] hover:text-[#005321] transition-colors uppercase hover:underline"
        >
          Applicants
        </Link>
      </div>
    </div>
  );
}
