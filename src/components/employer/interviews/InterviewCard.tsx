"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar,
  MessageSquare,
  Eye,
  Lock,
  ArrowRight,
} from "lucide-react";
import type { EmployerInterviewRow } from "@/actions/employer/hiring";
import { suggestedUpgradeTier } from "@/lib/entitlements/ui-copy";

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
    <li className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-slate-200/60 transition-all">
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

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href={`/employer/candidates/${interview.candidateId}?jobId=${interview.jobId}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#006e2f] px-4 text-xs font-bold text-white hover:bg-[#005c26] transition-colors"
          >
            <Eye size={14} aria-hidden />
            {interview.isPreview ? "Preview" : "Profile"}
          </Link>
          <Link
            href={`/employer/jobs/${interview.jobId}/applicants`}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Pipeline
            <ArrowRight size={14} aria-hidden />
          </Link>
          {messagingEnabled ? (
            <Link
              href="/employer/messages"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              title="Message candidate"
            >
              <MessageSquare size={15} aria-hidden />
            </Link>
          ) : (
            <Link
              href={`/employer/checkout/${suggestedUpgradeTier(planSlug, "messaging")}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#006e2f]/20 bg-[#ebfdf2] text-[#006e2f] hover:bg-[#d4f8e4] transition-colors"
              title="Upgrade to message"
            >
              <MessageSquare size={15} aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </li>
  );
}
