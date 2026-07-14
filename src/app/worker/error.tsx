"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorState } from "@/components/shared/ErrorState";
import { WorkerPageShell } from "@/components/worker/layout";

export default function WorkerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <WorkerPageShell width="narrow" className="py-16 items-center">
      <div className="flex flex-col items-center gap-4">
        <ErrorState
          title="Could not load this page"
          description="Something went wrong while loading your worker portal. Please try again."
        />
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-lg bg-[#006e2f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#005c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 focus-visible:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </WorkerPageShell>
  );
}
