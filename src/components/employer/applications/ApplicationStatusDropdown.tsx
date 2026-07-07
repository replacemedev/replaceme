"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { updateApplicationStatus } from "@/actions/applications";
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
  ApplicationStatus,
} from "@/types/applications";
import { toast } from "sonner";

interface ApplicationStatusDropdownProps {
  applicationId: string;
  status: ApplicationStatus;
  disabled?: boolean;
}

function selectStyles(status: ApplicationStatus): string {
  switch (status) {
    case "INTERVIEW_SCHEDULED":
      return "border-blue-200 bg-blue-50 text-blue-800 focus:ring-blue-500/30";
    case "UNDER_REVIEW":
      return "border-emerald-200 bg-emerald-50 text-emerald-800 focus:ring-emerald-500/30";
    case "REJECTED":
      return "border-red-200 bg-red-50 text-red-800 focus:ring-red-500/30";
    case "HIRED":
      return "border-violet-200 bg-violet-50 text-violet-800 focus:ring-violet-500/30";
    case "PENDING":
    default:
      return "border-slate-200 bg-slate-50 text-slate-700 focus:ring-slate-500/30";
  }
}

export function ApplicationStatusDropdown({
  applicationId,
  status,
  disabled = false,
}: ApplicationStatusDropdownProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (nextStatus: ApplicationStatus) => {
    if (nextStatus === status || isPending) return;

    startTransition(async () => {
      const result = await updateApplicationStatus(applicationId, nextStatus);

      if (!result.success) {
        toast.error(result.error ?? "Failed to update application status.");
        return;
      }

      toast.success("Application status updated.");
      router.refresh();
    });
  };

  return (
    <div className="relative z-20 inline-flex items-center">
      {isPending && (
        <Loader2
          className="absolute -left-5 h-3.5 w-3.5 animate-spin text-slate-400"
          aria-hidden
        />
      )}
      <select
        value={status}
        disabled={disabled || isPending}
        onChange={(e) => handleChange(e.target.value as ApplicationStatus)}
        aria-label="Application status"
        className={`relative z-30 w-fit max-w-[140px] text-xs py-1 pl-2 pr-7 rounded-md border font-bold shadow-xs transition-colors focus:outline-hidden focus:ring-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${selectStyles(status)}`}
      >
        {APPLICATION_STATUSES.filter((value) => value !== "WITHDRAWN").map((value) => (
          <option key={value} value={value}>
            {APPLICATION_STATUS_LABELS[value]}
          </option>
        ))}
      </select>
    </div>
  );
}
