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
          result.pinned ? "Candidate pinned to talent pool." : "Candidate unpinned."
        );
      } else {
        toast.error(result.error ?? "Could not update pin.");
      }
    });
  };

  if (isPreview) {
    return (
      <div className={`${EMPLOYER_CARD} p-5`}>
        <UnlockOverlay feature="identity" currentPlan={planSlug} />
      </div>
    );
  }

  return (
    <div className={`${EMPLOYER_CARD} p-5 space-y-4 lg:sticky lg:top-28`}>
      <h2 className="text-sm font-bold text-slate-900">Actions</h2>

      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
        <span className="text-xs font-semibold text-slate-600">Talent pool</span>
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
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#006e2f] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#005c26] disabled:opacity-60"
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
          className="w-full justify-center"
        />
      )}

      <Link
        href={`/employer/jobs/${jobId}/applicants`}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
      >
        <Calendar className="h-4 w-4" aria-hidden />
        Schedule in pipeline
      </Link>

      <FeatureGate
        allowed={resumeDownloadEnabled && Boolean(resumeUrl)}
        feature="resume"
        currentPlan={planSlug}
        preview={
          <UnlockOverlay feature="resume" currentPlan={planSlug} compact />
        }
      >
        {resumeUrl ? (
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Download resume
          </a>
        ) : null}
      </FeatureGate>
    </div>
  );
}
