"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Calendar, MessageSquare, Bookmark, Paperclip, Download } from "lucide-react";
import { toast } from "sonner";
import { EmployerOpenMessagingThreadButton } from "@/components/shared/messaging/useOpenEmployerMessagingThread";
import { togglePin } from "@/actions/employer/pinned";
import { FeatureGate } from "@/components/shared/entitlements/FeatureGate";
import { UnlockOverlay } from "@/components/shared/entitlements/UnlockOverlay";
import { UpgradeCTA } from "@/components/shared/entitlements/UpgradeCTA";

interface CandidateProfileActionsProps {
  candidateId: string;
  jobId: string;
  planSlug: string;
  messagingEnabled: boolean;
  messagingThreadId?: string | null;
  resumeDownloadEnabled: boolean;
  resumeUrl: string | null;
  cvUrl: string | null;
  isPreview: boolean;
  isPinned: boolean;
}

export function CandidateProfileActions({
  candidateId,
  jobId,
  planSlug,
  messagingEnabled,
  messagingThreadId,
  resumeDownloadEnabled,
  resumeUrl,
  cvUrl,
  isPreview,
  isPinned: initialPinned,
}: CandidateProfileActionsProps) {
  const [isPinned, setIsPinned] = useState(initialPinned);
  const [, startPinTransition] = useTransition();

  const handlePinToggle = () => {
    startPinTransition(async () => {
      const result = await togglePin(candidateId);
      if (result.success) {
        setIsPinned(result.pinned ?? false);
        toast.success(
          result.pinned ? "Candidate saved to talent pool." : "Candidate removed from talent pool."
        );
      } else {
        toast.error(result.error ?? "Could not update talent pool status.");
      }
    });
  };

  if (isPreview) {
    return (
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 sm:p-6">
        <UnlockOverlay feature="identity" currentPlan={planSlug} />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 sm:p-6 space-y-4 lg:sticky lg:top-28">
      <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase text-left">
        Actions
      </h2>

      <div className="flex flex-col gap-3">
        {messagingEnabled ? (
          <EmployerOpenMessagingThreadButton
            jobId={jobId}
            candidateId={candidateId}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#006e2f] px-4 py-2.5 text-sm font-bold text-white transition-all shadow-sm hover:shadow-md hover:bg-[#005c26] active:scale-[0.98] disabled:opacity-60 cursor-pointer h-[42px]"
          >
            <MessageSquare className="h-4 w-4" aria-hidden />
            Message candidate
          </EmployerOpenMessagingThreadButton>
        ) : (
          <UpgradeCTA
            feature="messaging"
            currentPlan={planSlug}
            variant="secondary"
            label="Upgrade to message"
            className="w-full justify-center rounded-xl py-2.5 text-sm font-bold h-[42px]"
          />
        )}

        <Link
          href={`/employer/jobs/${jobId}/applicants`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-[0.98] h-[42px]"
        >
          <Calendar className="h-4 w-4 text-slate-400" aria-hidden />
          Schedule
        </Link>

        <button
          type="button"
          onClick={handlePinToggle}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all active:scale-[0.98] cursor-pointer h-[42px] ${
            isPinned
              ? "border-emerald-200 bg-[#ebfdf2]/50 text-[#006e2f] hover:bg-[#ebfdf2]/70"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
          }`}
        >
          <Bookmark
            size={16}
            className={isPinned ? "fill-[#006e2f] text-[#006e2f]" : "text-slate-400"}
          />
          {isPinned ? "Saved to Talent Pool" : "Save to Talent Pool"}
        </button>
      </div>

      {(resumeUrl || cvUrl) && (
        <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100 text-left">
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-1">
            Documents
          </p>

          {resumeUrl && (
            <FeatureGate
              allowed={resumeDownloadEnabled}
              feature="resume"
              currentPlan={planSlug}
              preview={
                <UnlockOverlay feature="resume" currentPlan={planSlug} compact />
              }
            >
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-between rounded-xl bg-slate-50 hover:bg-slate-100 p-3.5 text-xs font-bold text-slate-700 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Paperclip className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  <span>Resume</span>
                </div>
                <Download className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </a>
            </FeatureGate>
          )}

          {cvUrl && (
            <FeatureGate
              allowed={resumeDownloadEnabled}
              feature="resume"
              currentPlan={planSlug}
              preview={
                <UnlockOverlay feature="resume" currentPlan={planSlug} compact />
              }
            >
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-between rounded-xl bg-slate-50 hover:bg-slate-100 p-3.5 text-xs font-bold text-slate-700 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Paperclip className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  <span>Curriculum Vitae (CV)</span>
                </div>
                <Download className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </a>
            </FeatureGate>
          )}
        </div>
      )}
    </div>
  );
}
