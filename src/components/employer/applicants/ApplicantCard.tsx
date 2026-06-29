"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Trash2, Eye, Lock } from "lucide-react";
import { Applicant } from "@/types/employer/applicants";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { ApplicationStatusDropdown } from "@/components/employer/applications/ApplicationStatusDropdown";
import { ApplicantActions } from "./ApplicantActions";
import { UnlockOverlay } from "@/components/shared/entitlements/UnlockOverlay";
import { suggestedUpgradeTier } from "@/lib/entitlements/ui-copy";

interface ApplicantCardProps {
  applicant: Applicant;
  jobId?: string;
  planSlug: string;
  messagingEnabled?: boolean;
  resumeDownloadEnabled?: boolean;
  onMessageClick?: () => void;
  onDeleteClick?: () => void;
  variant?: "default" | "kanban";
}

export function ApplicantCard({
  applicant,
  jobId,
  planSlug,
  messagingEnabled = true,
  resumeDownloadEnabled = true,
  onMessageClick,
  onDeleteClick,
  variant = "default",
}: ApplicantCardProps) {
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
    <div
      className={`bg-white border border-slate-100 rounded-3xl p-5 flex flex-col justify-between shadow-sm min-h-[220px] transition-all hover:shadow-md hover:border-slate-200/50 ${
        variant === "kanban" ? "overflow-visible" : ""
      }`}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-12 h-12 rounded-2xl bg-emerald-50 border border-slate-100 shrink-0 overflow-hidden">
              {applicant.avatarUrl && !isPreview ? (
                <Image
                  src={applicant.avatarUrl}
                  alt={applicant.name}
                  fill
                  className="rounded-2xl object-cover"
                  sizes="48px"
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center font-bold text-sm rounded-2xl ${
                    isPreview
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

            <div className="min-w-0">
              <h3 className="text-xs font-extrabold text-slate-800 leading-none mb-1 inline-flex items-center gap-1 flex-wrap">
                {applicant.name}
                {isPreview ? (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 uppercase tracking-wider">
                    Preview
                  </span>
                ) : (
                  <VerifiedBadge show={applicant.isVerified} size="sm" />
                )}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold leading-none truncate">
                {applicant.role}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase ${matchPillStyle}`}
            >
              {matchText}
            </span>
            <ApplicationStatusDropdown
              applicationId={applicant.id}
              status={applicant.status}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {applicant.skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-[10px] text-slate-500 font-bold rounded-lg"
            >
              {skill}
            </span>
          ))}
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

      <div className="mt-5 flex gap-2 pt-4 border-t border-slate-50 items-center">
        {isRejected ? (
          <>
            <button
              type="button"
              className="flex-1 h-9 bg-white hover:bg-slate-50 border border-slate-100 text-slate-500 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
            >
              View History
            </button>
            <button
              onClick={onDeleteClick}
              type="button"
              className="w-9 h-9 border border-red-100 hover:bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shrink-0 transition-colors cursor-pointer"
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
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-[#006e2f] text-xs font-bold text-white transition-colors hover:bg-[#005c26]"
            >
              <Eye size={14} />
              {isPreview ? "Preview profile" : "View profile"}
            </Link>
            ) : null}
            {messagingEnabled ? (
              <button
                onClick={onMessageClick}
                type="button"
                className="w-9 h-9 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-500 hover:text-slate-800 rounded-2xl flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                title="Chat with candidate"
              >
                <MessageSquare size={15} />
              </button>
            ) : (
              <Link
                href={`/employer/checkout/${suggestedUpgradeTier(planSlug, "messaging")}`}
                className="w-9 h-9 bg-[#ebfdf2] hover:bg-[#d4f8e4] border border-[#006e2f]/20 text-[#006e2f] rounded-2xl flex items-center justify-center shrink-0 transition-colors"
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
    </div>
  );
}
