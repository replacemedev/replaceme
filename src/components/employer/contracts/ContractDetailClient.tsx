"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  updateEmployerContract,
  terminateEmployerContract,
  type EmployerContractDetail,
} from "@/actions/employer/contracts";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EMPLOYER_CARD } from "@/lib/employer/ui-tokens";
import { ContractStickyActions } from "./ContractStickyActions";

export function ContractDetailClient({
  contract,
}: {
  contract: EmployerContractDetail;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [hourlyRate, setHourlyRate] = useState(contract.hourlyRate);
  const [weeklyHours, setWeeklyHours] = useState(contract.weeklyHours);
  const [status, setStatus] = useState(contract.status);
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);

  const save = () => {
    startTransition(async () => {
      const toastId = toast.loading("Saving contract...");
      const result = await updateEmployerContract({
        contractId: contract.id,
        hourlyRate,
        weeklyHours,
        status: status as "active" | "paused" | "terminated" | "offered",
      });
      if (result.success) {
        toast.success("Contract updated", { id: toastId });
        router.refresh();
      } else {
        toast.error(result.error ?? "Update failed", { id: toastId });
      }
    });
  };

  const terminate = () => {
    startTransition(async () => {
      const toastId = toast.loading("Terminating...");
      const result = await terminateEmployerContract(contract.id);
      if (result.success) {
        toast.success("Contract terminated", { id: toastId });
        setShowTerminateDialog(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed", { id: toastId });
      }
    });
  };

  return (
    <>
      <div className={`${EMPLOYER_CARD} space-y-6 p-6`}>
        <p className="text-sm text-slate-500 font-medium">
          {contract.workerName} · {contract.workerRole}
          {contract.jobTitle ? ` · ${contract.jobTitle}` : ""}
        </p>

        <label className="block text-sm font-semibold text-slate-700">
          Hourly rate ($)
          <input
            type="number"
            min={0}
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006e2f]/30"
          />
        </label>

        <label className="block text-sm font-semibold text-slate-700">
          Weekly hours
          <input
            type="number"
            min={1}
            max={168}
            value={weeklyHours}
            onChange={(e) => setWeeklyHours(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006e2f]/30"
          />
        </label>

        <label className="block text-sm font-semibold text-slate-700">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006e2f]/30"
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="offered">Offered</option>
            <option value="terminated">Terminated</option>
          </select>
        </label>

        <div className="hidden lg:flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            disabled={isPending}
            onClick={save}
            className="rounded-xl bg-[#006e2f] px-4 py-2 text-sm font-bold text-white hover:bg-[#005c26] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 focus-visible:ring-offset-2"
          >
            Save changes
          </button>
          {status !== "terminated" ? (
            <button
              type="button"
              disabled={isPending}
              onClick={() => setShowTerminateDialog(true)}
              className="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Terminate contract
            </button>
          ) : null}
        </div>
      </div>

      <ContractStickyActions isPending={isPending} onSave={save} />

      <ConfirmDialog
        open={showTerminateDialog}
        title="Terminate contract?"
        description="This will end the working relationship with this team member. You can still view the contract record afterward."
        confirmLabel="Terminate"
        cancelLabel="Keep contract"
        variant="danger"
        loading={isPending}
        onConfirm={terminate}
        onCancel={() => setShowTerminateDialog(false)}
      />
    </>
  );
}
