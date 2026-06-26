"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  updateEmployerContract,
  terminateEmployerContract,
  type EmployerContractDetail,
} from "@/actions/employer/contracts";

export function ContractDetailClient({ contract }: { contract: EmployerContractDetail }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [hourlyRate, setHourlyRate] = useState(contract.hourlyRate);
  const [weeklyHours, setWeeklyHours] = useState(contract.weeklyHours);
  const [status, setStatus] = useState(contract.status);

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
    if (!confirm("Terminate this contract?")) return;
    startTransition(async () => {
      const toastId = toast.loading("Terminating...");
      const result = await terminateEmployerContract(contract.id);
      if (result.success) {
        toast.success("Contract terminated", { id: toastId });
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed", { id: toastId });
      }
    });
  };

  return (
    <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-6">
      <p className="text-sm text-slate-500">
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
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
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
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-sm font-semibold text-slate-700">
        Status
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="offered">Offered</option>
          <option value="terminated">Terminated</option>
        </select>
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={save}
          className="rounded-xl bg-[#006e2f] px-4 py-2 text-sm font-bold text-white hover:bg-[#005c26] disabled:opacity-50"
        >
          Save changes
        </button>
        {status !== "terminated" ? (
          <button
            type="button"
            disabled={isPending}
            onClick={terminate}
            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Terminate contract
          </button>
        ) : null}
      </div>
    </div>
  );
}
