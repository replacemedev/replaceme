"use client";

import { EmployerStickyActionBar } from "@/components/employer/layout";

interface ContractStickyActionsProps {
  isPending: boolean;
  onSave: () => void;
}

export function ContractStickyActions({
  isPending,
  onSave,
}: ContractStickyActionsProps) {
  return (
    <EmployerStickyActionBar>
      <button
        type="button"
        disabled={isPending}
        onClick={onSave}
        className="w-full rounded-xl bg-[#006e2f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#005c26] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 focus-visible:ring-offset-2"
      >
        Save contract changes
      </button>
    </EmployerStickyActionBar>
  );
}
