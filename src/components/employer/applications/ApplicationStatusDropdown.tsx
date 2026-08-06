"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { HireWorkerModal } from "@/components/employer/applicants/HireWorkerModal";
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
  candidateName?: string;
}

function selectStyles(_status: ApplicationStatus): string {
  return "border-[#006e2f]/25 bg-[#ebfdf2] text-[#006e2f] focus:ring-[#006e2f]/30";
}

export function ApplicationStatusDropdown({
  applicationId,
  status,
  disabled = false,
  candidateName = "Candidate",
}: ApplicationStatusDropdownProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);

  const handleChange = (nextStatus: ApplicationStatus) => {
    if (nextStatus === status || isPending) return;

    if (nextStatus === "HIRED") {
      setIsHireModalOpen(true);
      return;
    }

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

  const handleConfirmHire = (employmentStatus: string, showHiredBadge: boolean) => {
    setIsHireModalOpen(false);
    startTransition(async () => {
      const result = await updateApplicationStatus(
        applicationId,
        "HIRED",
        employmentStatus,
        showHiredBadge
      );

      if (!result.success) {
        toast.error(result.error ?? "Failed to update application status.");
        return;
      }

      toast.success("Candidate successfully hired!");
      router.refresh();
    });
  };

  return (
    <>
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

      <HireWorkerModal
        open={isHireModalOpen}
        onClose={() => setIsHireModalOpen(false)}
        candidateName={candidateName}
        onConfirm={handleConfirmHire}
        isPending={isPending}
      />
    </>
  );
}
