import React from "react";
import Link from "next/link";
import { RecentApplicant } from "@/types/employer";

interface RecentApplicantRowProps {
  applicant: RecentApplicant;
  messagingEnabled?: boolean;
  compact?: boolean;
}

export function RecentApplicantRow({
  applicant,
  messagingEnabled = true,
  compact = false,
}: RecentApplicantRowProps) {
  const formattedDate = new Date(applicant.created_at).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  );

  const nameParts = applicant.name.split(" ");
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0]?.[0] || ""}${nameParts[1]?.[0] || ""}`.toUpperCase()
      : applicant.name.substring(0, 2).toUpperCase();

  const isPreviewOnly = !applicant.is_unlocked;

  return (
    <div
      className={`flex items-center justify-between gap-3 ${
        compact
          ? "p-0"
          : "p-4 bg-white border border-slate-200 rounded-xl hover:shadow-xs transition-shadow"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
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

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-900 truncate">
              {applicant.name}
            </span>
            {isPreviewOnly ? (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 uppercase tracking-wider">
                Preview only
              </span>
            ) : null}
          </div>
          <p className="text-xs text-slate-500 font-medium truncate">
            Applied for{" "}
            <Link
              href={`/employer/jobs/${applicant.job_id}`}
              className="text-[#006e2f] hover:text-[#005321] hover:underline font-semibold"
            >
              {applicant.applied_role}
            </Link>{" "}
            · {formattedDate}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/employer/jobs/${applicant.job_id}/applicants`}
          className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          Review
        </Link>
        {messagingEnabled ? (
          <Link
            href={`/employer/messages?jobId=${applicant.job_id}&candidateId=${applicant.candidate_id}`}
            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-white bg-[#006e2f] hover:bg-[#005c26] rounded-lg transition-colors cursor-pointer"
          >
            Message
          </Link>
        ) : (
          <Link
            href="/employer/pricing"
            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-[#006e2f] bg-[#ebfdf2] hover:bg-[#d4f8e4] border border-[#006e2f]/20 rounded-lg transition-colors cursor-pointer"
          >
            Upgrade
          </Link>
        )}
      </div>
    </div>
  );
}
