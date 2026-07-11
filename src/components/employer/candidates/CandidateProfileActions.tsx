"use client";

import { useState, useTransition } from "react";
import { MessageSquare, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { EmployerOpenMessagingThreadButton } from "@/components/shared/messaging/useOpenEmployerMessagingThread";
import { togglePin } from "@/actions/employer/pinned";
import { UnlockOverlay } from "@/components/shared/entitlements/UnlockOverlay";
import { UpgradeCTA } from "@/components/shared/entitlements/UpgradeCTA";
import { DownloadResumeButton } from "./DownloadResumeButton";

interface CandidateProfileActionsProps {
  candidateId: string;
  jobId: string;
  planSlug: string;
  messagingEnabled: boolean;
  messagingThreadId?: string | null;
  resumeDownloadEnabled: boolean;
  resumeUrl: string | null;
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
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 sm:p-6 space-y-4 lg:sticky lg:top-6">
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

      {resumeUrl && (
        <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100 text-left">
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-1">
            Documents
          </p>
          <DownloadResumeButton
            candidateId={candidateId}
            resumeUrl={resumeUrl}
            planSlug={planSlug}
            resumeDownloadEnabled={resumeDownloadEnabled}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
