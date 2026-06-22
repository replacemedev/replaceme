import React from "react";
import Link from "next/link";
import { RecentApplicant } from "@/types/employer";

interface RecentApplicantRowProps {
  applicant: RecentApplicant;
}

export function RecentApplicantRow({ applicant }: RecentApplicantRowProps) {
  // Format applied date
  const formattedDate = new Date(applicant.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  // Initials generation
  const nameParts = applicant.name.split(" ");
  const initials = nameParts.length >= 2 
    ? `${nameParts[0]?.[0] || ""}${nameParts[1]?.[0] || ""}`.toUpperCase()
    : applicant.name.substring(0, 2).toUpperCase();

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-xs transition-shadow gap-4">
      {/* Left Details: Avatar, Name, Job Link */}
      <div className="flex items-center gap-3">
        {/* Avatar / Initials bubble */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600 border border-slate-200 select-none overflow-hidden relative">
          {applicant.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={applicant.avatar_url} 
              alt={applicant.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        {/* Name & Role details */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 truncate">
              {applicant.name}
            </span>
            {!applicant.is_unlocked && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 uppercase tracking-wider">
                LOCKED
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Applied for{" "}
            <Link 
              href={`/jobs/${applicant.job_id}`}
              className="text-[#006e2f] hover:text-[#005321] hover:underline font-semibold"
            >
              {applicant.applied_role}
            </Link>{" "}
            • {formattedDate}
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <Link
          href={`/jobs/${applicant.job_id}/applicants`}
          className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          Review Profile
        </Link>
        <Link
          href={`/messages?candidateId=${applicant.candidate_id}`}
          className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-white bg-[#006e2f] hover:bg-[#005c26] rounded-lg transition-colors cursor-pointer"
        >
          Message
        </Link>
      </div>
    </div>
  );
}
