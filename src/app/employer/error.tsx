"use client";

import { ErrorState } from "@/components/shared/ErrorState";
import { EmployerPageShell } from "@/components/employer/layout";

export default function EmployerError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <EmployerPageShell width="narrow" className="py-16 items-center">
      <div className="flex flex-col items-center gap-4">
        <ErrorState
          title="Could not load this page"
          description="Something went wrong in your employer portal. Please try again."
        />
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-lg bg-[#006e2f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#005c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 focus-visible:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </EmployerPageShell>
  );
}
