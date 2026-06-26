"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Handshake, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { scheduleInterview, sendJobOffer } from "@/actions/employer/hiring";

interface ApplicantActionsProps {
  applicationId: string;
  status: string;
  isUnlocked: boolean;
}

export function ApplicantActions({
  applicationId,
  status,
  isUnlocked,
}: ApplicantActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!isUnlocked) return null;

  const canSchedule =
    status === "PENDING" || status === "UNDER_REVIEW";
  const canOffer =
    status === "INTERVIEW_SCHEDULED" || status === "UNDER_REVIEW";

  const handleSchedule = () => {
    startTransition(async () => {
      const toastId = toast.loading("Scheduling interview...");
      const result = await scheduleInterview(applicationId);
      if (result.success) {
        toast.success("Interview scheduled", { id: toastId });
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to schedule", { id: toastId });
      }
    });
  };

  const handleOffer = () => {
    startTransition(async () => {
      const toastId = toast.loading("Sending offer...");
      const result = await sendJobOffer(applicationId);
      if (result.success) {
        toast.success(result.message ?? "Offer sent", { id: toastId });
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to send offer", { id: toastId });
      }
    });
  };

  if (!canSchedule && !canOffer) return null;

  return (
    <div className="flex flex-wrap gap-2 border-t border-slate-50 pt-3">
      {canSchedule ? (
        <button
          type="button"
          disabled={isPending}
          onClick={handleSchedule}
          className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Calendar className="h-3 w-3" />
          )}
          Schedule Interview
        </button>
      ) : null}
      {canOffer ? (
        <button
          type="button"
          disabled={isPending}
          onClick={handleOffer}
          className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-[#006e2f] px-3 text-[10px] font-bold text-white hover:bg-[#005c26] disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Handshake className="h-3 w-3" />
          )}
          Send Offer
        </button>
      ) : null}
    </div>
  );
}
