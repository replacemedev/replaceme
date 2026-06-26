"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { respondToContractOffer } from "@/actions/worker/contracts";
import type { WorkerContractRow } from "@/lib/validations/worker/phase2";
import { EmptyState } from "@/components/shared/EmptyState";
import { FileText } from "lucide-react";

interface ContractsClientProps {
  contracts: WorkerContractRow[];
}

export function ContractsClient({ contracts }: ContractsClientProps) {
  const [pending, startTransition] = useTransition();

  function handleResponse(contractId: string, action: "accept" | "decline") {
    startTransition(async () => {
      const result = await respondToContractOffer({ contractId, action });
      if (result.error) toast.error(result.error);
      else toast.success(action === "accept" ? "Offer accepted" : "Offer declined");
    });
  }

  if (contracts.length === 0) {
    return (
      <EmptyState
        icon={<FileText size={22} />}
        title="No contract offers"
        description="When employers send you offers, they will appear here for review."
        actionLabel="Browse jobs"
        actionHref="/worker/jobs"
      />
    );
  }

  return (
    <ul className="space-y-4">
      {contracts.map((c) => (
        <li
          key={c.id}
          className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <p className="text-sm font-bold text-slate-900">
              {c.jobTitle ?? "Contract offer"}
            </p>
            <p className="text-sm text-slate-500">{c.companyName}</p>
            <p className="text-xs text-slate-400 mt-1">
              ${c.hourlyRate}/hr · {c.weeklyHours}h/wk · {c.status}
            </p>
          </div>
          {c.status === "offered" ? (
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => handleResponse(c.id, "accept")}
                className="px-4 py-2 text-xs font-bold text-white bg-[#006e2f] rounded-lg disabled:opacity-60"
              >
                Accept
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => handleResponse(c.id, "decline")}
                className="px-4 py-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg disabled:opacity-60"
              >
                Decline
              </button>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
