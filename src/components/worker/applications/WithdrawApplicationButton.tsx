"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { withdrawApplication } from "@/actions/worker/applications";
import type { ApplicationStatus } from "@/types/applications";

const WITHDRAWABLE: ApplicationStatus[] = [
  "PENDING",
  "UNDER_REVIEW",
  "INTERVIEW_SCHEDULED",
];

interface WithdrawApplicationButtonProps {
  applicationId: string;
  status: ApplicationStatus;
  className?: string;
}

export function WithdrawApplicationButton({
  applicationId,
  status,
  className,
}: WithdrawApplicationButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!WITHDRAWABLE.includes(status)) return null;

  function handleWithdraw() {
    if (!window.confirm("Withdraw this application? This cannot be undone.")) {
      return;
    }

    startTransition(async () => {
      const result = await withdrawApplication(applicationId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Application withdrawn");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleWithdraw}
      disabled={pending}
      className={
        className ??
        "inline-flex h-9 items-center rounded-xl border border-red-200 bg-white px-4 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
      }
    >
      {pending ? "Withdrawing…" : "Withdraw application"}
    </button>
  );
}
