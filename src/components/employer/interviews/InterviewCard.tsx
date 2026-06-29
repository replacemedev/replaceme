"use client";

import React from "react";
import { Calendar, Lock } from "lucide-react";
import type { EmployerInterviewRow } from "@/actions/employer/hiring";
import { EmployerInlineActions } from "@/components/employer/layout/EmployerInlineActions";

interface InterviewCardProps {
  interview: EmployerInterviewRow;
  planSlug: string;
  messagingEnabled: boolean;
}

export function InterviewCard({
  interview,
  planSlug,
  messagingEnabled,
}: InterviewCardProps) {
  const scheduledDate = new Date(interview.scheduledAt);

  return (
    <li className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-slate-200/60 hover:shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#ebfdf2] text-[#006e2f]">
            {interview.isPreview ? (
              <Lock className="h-5 w-5" aria-hidden />
            ) : (
              <Calendar className="h-5 w-5" aria-hidden />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-slate-900 truncate">
              {interview.candidateName}
            </p>
            <p className="text-xs font-semibold text-[#006e2f] mt-0.5 truncate">
              {interview.jobTitle}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-2">
              Scheduled{" "}
              {scheduledDate.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
            {interview.isPreview ? (
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                Full name unlocks on Starter and above.
              </p>
            ) : null}
          </div>
        </div>

        <EmployerInlineActions
          planSlug={planSlug}
          messagingEnabled={messagingEnabled}
          profileHref={`/employer/candidates/${interview.candidateId}?jobId=${interview.jobId}`}
          profileLabel={interview.isPreview ? "Preview" : "Profile"}
          pipelineHref={`/employer/jobs/${interview.jobId}/applicants`}
          jobId={interview.jobId}
          candidateId={interview.candidateId}
        />
      </div>
    </li>
  );
}
