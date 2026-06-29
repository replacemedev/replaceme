"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { UpgradeCTA } from "@/components/shared/entitlements/UpgradeCTA";
import { suggestedUpgradeTier } from "@/lib/entitlements/ui-copy";
import { EmployerOpenMessagingThreadButton } from "@/components/shared/messaging/useOpenEmployerMessagingThread";

interface EmployerMessageActionProps {
  planSlug: string;
  messagingEnabled: boolean;
  jobId?: string;
  candidateId?: string;
  variant?: "icon" | "button";
  className?: string;
}

export function EmployerMessageAction({
  planSlug,
  messagingEnabled,
  jobId,
  candidateId,
  variant = "icon",
  className = "",
}: EmployerMessageActionProps) {
  const canOpenThread = Boolean(jobId && candidateId);

  if (messagingEnabled) {
    if (canOpenThread) {
      const buttonClass =
        variant === "button"
          ? `inline-flex h-9 items-center gap-1.5 rounded-2xl border border-emerald-100 bg-[#f0fdf4]/50 px-4 text-xs font-bold text-[#006e2f] transition-colors hover:bg-[#f0fdf4] disabled:opacity-60 ${className}`
          : `inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:opacity-60 ${className}`;

      return (
        <EmployerOpenMessagingThreadButton
          jobId={jobId!}
          candidateId={candidateId!}
          className={buttonClass}
        >
          {variant === "button" ? (
            <>
              <MessageSquare size={13} aria-hidden />
              Message
            </>
          ) : (
            <MessageSquare size={15} aria-hidden />
          )}
        </EmployerOpenMessagingThreadButton>
      );
    }

    if (variant === "button") {
      return (
        <Link
          href="/employer/messages"
          className={`inline-flex h-9 items-center gap-1.5 rounded-2xl border border-emerald-100 bg-[#f0fdf4]/50 px-4 text-xs font-bold text-[#006e2f] transition-colors hover:bg-[#f0fdf4] ${className}`}
        >
          <MessageSquare size={13} aria-hidden />
          Message
        </Link>
      );
    }

    return (
      <Link
        href="/employer/messages"
        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 ${className}`}
        title="Message candidate"
        aria-label="Message candidate"
      >
        <MessageSquare size={15} aria-hidden />
      </Link>
    );
  }

  if (variant === "button") {
    return (
      <UpgradeCTA
        feature="messaging"
        currentPlan={planSlug}
        variant="secondary"
        label="Upgrade to message"
        className={className}
      />
    );
  }

  return (
    <Link
      href={`/employer/checkout/${suggestedUpgradeTier(planSlug, "messaging")}`}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#006e2f]/20 bg-[#ebfdf2] text-[#006e2f] transition-colors hover:bg-[#d4f8e4] ${className}`}
      title="Upgrade to message"
      aria-label="Upgrade to message"
    >
      <MessageSquare size={15} aria-hidden />
    </Link>
  );
}

interface EmployerInlineActionsProps {
  planSlug: string;
  messagingEnabled: boolean;
  profileHref: string;
  profileLabel?: string;
  pipelineHref?: string;
  pipelineLabel?: string;
  jobId?: string;
  candidateId?: string;
  className?: string;
}

export function EmployerInlineActions({
  planSlug,
  messagingEnabled,
  profileHref,
  profileLabel = "Profile",
  pipelineHref,
  pipelineLabel = "Pipeline",
  jobId,
  candidateId,
  className = "",
}: EmployerInlineActionsProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 shrink-0 ${className}`}>
      <Link
        href={profileHref}
        className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#006e2f] px-4 text-xs font-bold text-white transition-colors hover:bg-[#005c26]"
      >
        {profileLabel}
      </Link>
      {pipelineHref ? (
        <Link
          href={pipelineHref}
          className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
        >
          {pipelineLabel}
        </Link>
      ) : null}
      <EmployerMessageAction
        planSlug={planSlug}
        messagingEnabled={messagingEnabled}
        jobId={jobId}
        candidateId={candidateId}
        variant="icon"
      />
    </div>
  );
}
