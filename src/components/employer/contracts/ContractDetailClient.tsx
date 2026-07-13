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
  const [employmentStatus, setEmploymentStatus] = useState(contract.employmentStatus || "Full-time");
  const [showHiredBadge, setShowHiredBadge] = useState(contract.showHiredBadge);
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);

  const save = () => {
    startTransition(async () => {
      const toastId = toast.loading("Saving contract...");
      const result = await updateEmployerContract({
        contractId: contract.id,
        hourlyRate,
        weeklyHours,
        status: status as "active" | "paused" | "terminated",
        employmentStatus,
        showHiredBadge,
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
            <option value="terminated">Terminated</option>
          </select>
        </label>

        <label className="block text-sm font-semibold text-slate-700">
          Employment Status
          <select
            value={employmentStatus}
            onChange={(e) => setEmploymentStatus(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006e2f]/30 bg-white"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
          </select>
        </label>

        <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
          <input
            type="checkbox"
            id="show-hired-badge-detail-checkbox"
            checked={showHiredBadge}
            onChange={(e) => setShowHiredBadge(e.target.checked)}
            className="w-4.5 h-4.5 rounded-md border-slate-350 text-[#006e2f] focus:ring-[#006e2f]/30 cursor-pointer mt-0.5 shrink-0"
          />
          <label htmlFor="show-hired-badge-detail-checkbox" className="select-none cursor-pointer">
            <span className="block text-xs font-bold text-slate-850">
              Display 'Hired' badge on Worker's public profile
            </span>
            <span className="block text-[10px] text-slate-500 font-semibold mt-0.5">
              This badge will be visible to everyone when checked. Toggle off to remove visibility immediately.
            </span>
          </label>
        </div>

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
