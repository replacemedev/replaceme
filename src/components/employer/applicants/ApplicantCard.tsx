"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AvatarImage } from "@/components/shared/media/AvatarImage";
import { MessageSquare, Trash2, Eye, Lock, Edit, Calendar } from "lucide-react";
import { Applicant } from "@/types/employer/applicants";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { ApplicationStatusDropdown } from "@/components/employer/applications/ApplicationStatusDropdown";
import { ApplicantActions } from "./ApplicantActions";
import { UnlockOverlay } from "@/components/shared/entitlements/UnlockOverlay";
import { suggestedUpgradeTier } from "@/lib/entitlements/ui-copy";
import { ClientFormattedDate } from "@/components/shared/ClientFormattedDate";
import { InterviewDetailModal } from "../interviews/InterviewDetailModal";

const AGENT_SKILLS = new Set([
  "ponytail",
  "underdeclared-agent",
  "friendly-greeter",
  "google-antigravity-sdk",
  "a11y-debugging",
  "chrome-devtools",
  "general-assistant",
  "safe-greeting",
  "memory-leak-debugging",
  "troubleshooting",
  "web-design-guidelines"
]);

function isAgentSkill(skillName: string) {
  return AGENT_SKILLS.has(skillName.toLowerCase().trim());
}

interface ApplicantCardProps {
  applicant: Applicant;
  jobId?: string;
  planSlug: string;
  messagingEnabled?: boolean;
  resumeDownloadEnabled?: boolean;
  onMessageClick?: () => void;
  onDeleteClick?: () => void;
}

export function ApplicantCard({
  applicant,
  jobId,
  planSlug,
  messagingEnabled = true,
  resumeDownloadEnabled = true,
  onMessageClick,
  onDeleteClick,
}: ApplicantCardProps) {
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const isPreview = !applicant.isUnlocked;
  const initials = applicant.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const isHighMatch = applicant.matchLabel === "high";
  const matchPillStyle = isHighMatch
    ? "bg-emerald-500 text-white"
    : "bg-slate-100 text-slate-500";
  const matchText = isHighMatch ? `${applicant.matchScore}% MATCH` : "LOW MATCH";

  const isRejected = applicant.status === "REJECTED";

  return (
    <div className="relative overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-5 flex flex-col justify-between min-h-[220px]">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
            <div className="relative w-12 h-12 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-emerald-50">
              {applicant.avatarUrl && !isPreview ? (
                <AvatarImage
                  src={applicant.avatarUrl}
                  alt={applicant.name}
                  initials={initials}
                  size="sm"
                  rounded="xl"
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center font-bold text-sm rounded-xl ${isPreview
                    ? "bg-slate-100 text-slate-400 blur-[1px]"
                    : "bg-emerald-100 text-emerald-800"
                    }`}
                >
                  {isPreview ? "?" : initials}
                </div>
              )}
              {isPreview ? (
                <span className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[2px]">
                  <Lock className="h-4 w-4 text-slate-500" aria-hidden />
                </span>
              ) : (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-extrabold text-slate-800 leading-snug mb-1 inline-flex items-center gap-1 flex-wrap">
                {applicant.name}
                {isPreview ? (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 uppercase tracking-wider">
                    Preview
                  </span>
                ) : (
                  <VerifiedBadge show={applicant.isVerified} size="sm" />
                )}
              </h3>
              <p className="text-[10px] text-slate-450 font-bold leading-none truncate">
                {applicant.role}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase whitespace-nowrap ${matchPillStyle}`}
            >
              {matchText}
            </span>
            <ApplicationStatusDropdown
              applicationId={applicant.id}
              status={applicant.status}
            />
          </div>
        </div>

        {applicant.status === "INTERVIEW_SCHEDULED" && (
          <div className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-100 rounded-lg p-2 mt-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Calendar className="h-3.5 w-3.5 text-slate-405 shrink-0" />
              <p className="text-[10px] font-extrabold text-slate-650 truncate">
                <ClientFormattedDate
                  date={applicant.interview?.scheduled_at || applicant.createdAt}
                />
              </p>
            </div>
            <button
              onClick={() => setIsRescheduleOpen(true)}
              type="button"
              className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-150 rounded-full shrink-0 transition-colors cursor-pointer"
              title="Edit/Reschedule Interview"
            >
              <Edit size={12} />
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-3">
          {applicant.skills.map((skill, idx) => {
            const isAgent = isAgentSkill(skill);
            return (
              <span
                key={idx}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-colors ${isAgent
                  ? "bg-blue-50 border-blue-200/50 text-blue-700 hover:bg-blue-100/50"
                  : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100/50"
                  }`}
              >
                {skill}
              </span>
            );
          })}
        </div>

        {isPreview ? (
          <UnlockOverlay feature="identity" currentPlan={planSlug} compact />
        ) : null}
      </div>

      <ApplicantActions
        applicationId={applicant.id}
        status={applicant.status}
        isUnlocked={applicant.isUnlocked}
      />

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
        {isRejected ? (
          <>
            <button
              type="button"
              className="flex-1 h-10 bg-white hover:bg-slate-50 border border-slate-200 text-slate-705 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              View History
            </button>
            <button
              onClick={onDeleteClick}
              type="button"
              className="w-10 h-10 border border-red-100 hover:bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              title="Delete application"
            >
              <Trash2 size={15} />
            </button>
          </>
        ) : (
          <>
            {jobId ? (
              <Link
                href={`/employer/candidates/${applicant.candidateId}?jobId=${jobId}`}
                className="flex-1 h-10 flex items-center justify-center gap-1.5 rounded-xl bg-[#006e2f] text-xs font-bold text-white transition-colors hover:bg-[#005c26]"
              >
                <Eye size={14} />
                {isPreview ? "Preview profile" : "View profile"}
              </Link>
            ) : null}
            {messagingEnabled ? (
              <button
                onClick={onMessageClick}
                type="button"
                className="w-10 h-10 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                title="Chat with candidate"
              >
                <MessageSquare size={15} />
              </button>
            ) : (
              <Link
                href={`/employer/checkout/${suggestedUpgradeTier(planSlug, "messaging")}`}
                className="w-10 h-10 bg-[#ebfdf2] hover:bg-[#d4f8e4] border border-[#006e2f]/20 text-[#006e2f] rounded-xl flex items-center justify-center shrink-0 transition-colors"
                title="Upgrade to message"
              >
                <MessageSquare size={15} />
              </Link>
            )}
          </>
        )}
      </div>

      {!isPreview && !resumeDownloadEnabled ? (
        <p className="mt-2 text-[10px] font-medium text-slate-400">
          Resume downloads unlock on your current plan settings.
        </p>
      ) : null}

      {isRescheduleOpen && (
        <InterviewDetailModal
          open={isRescheduleOpen}
          onClose={() => setIsRescheduleOpen(false)}
          interview={
            applicant.interview
              ? {
                id: applicant.interview.id,
                applicationId: applicant.id,
                jobId: applicant.jobId,
                candidateId: applicant.candidateId,
                jobTitle: applicant.role,
                candidateName: applicant.name,
                scheduledAt: applicant.interview.scheduled_at,
                meetingUrl: applicant.interview.meeting_link,
                status: applicant.interview.status,
                notes: applicant.interview.notes,
                isPreview,
              }
              : {
                applicationId: applicant.id,
                jobId: applicant.jobId,
                candidateId: applicant.candidateId,
                jobTitle: applicant.role,
                candidateName: applicant.name,
                scheduledAt: applicant.createdAt,
                meetingUrl: null,
                status: "scheduled",
                notes: null,
                isPreview,
              }
          }
        />
      )}
    </div>
  );
}
