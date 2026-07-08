"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Calendar, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { EmployerOpenMessagingThreadButton } from "@/components/shared/messaging/useOpenEmployerMessagingThread";
import { togglePin } from "@/actions/employer/pinned";
import { PinToggle } from "@/components/employer/pinned/PinToggle";
import { FeatureGate } from "@/components/shared/entitlements/FeatureGate";
import { UnlockOverlay } from "@/components/shared/entitlements/UnlockOverlay";
import { UpgradeCTA } from "@/components/shared/entitlements/UpgradeCTA";
import { EMPLOYER_CARD } from "@/lib/employer/ui-tokens";

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
          result.pinned ? "Candidate pinned to talent pool." : "Candidate unpinned."
        );
      } else {
        toast.error(result.error ?? "Could not update pin.");
      }
    });
  };

  if (isPreview) {
    return (
      <div className="bg-white border border-slate-100/90 shadow-xs sm:rounded-2xl p-6">
        <UnlockOverlay feature="identity" currentPlan={planSlug} />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100/90 shadow-xs sm:rounded-2xl p-6 space-y-4 lg:sticky lg:top-28">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Actions</h2>

      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
        <span className="text-xs font-bold text-slate-600">Talent pool</span>
        <PinToggle
          workerId={candidateId}
          isPinned={isPinned}
          onToggle={handlePinToggle}
        />
      </div>

      {messagingEnabled ? (
        <EmployerOpenMessagingThreadButton
          jobId={jobId}
          candidateId={candidateId}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#006e2f] px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#005c26] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
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
          className="w-full justify-center rounded-xl py-2.5 text-sm font-bold"
        />
      )}

      <Link
        href={`/employer/jobs/${jobId}/applicants`}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-[0.98]"
      >
        <Calendar className="h-4 w-4 text-slate-400" aria-hidden />
        Schedule
      </Link>

      {(resumeUrl || cvUrl) && (
        <div className="flex flex-col gap-1.5 pt-4 border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-1">
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
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 py-2.5 transition-colors"
              >
                Download resume
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
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 py-2.5 transition-colors"
              >
                Download CV
              </a>
            </FeatureGate>
          )}
        </div>
      )}
    </div>
  );
}
