"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
};

/**
 * Shared client error UI. Reports to Sentry when DSN is configured.
 */
export function RouteErrorFallback({
  error,
  reset,
  title = "Something went wrong",
  description = "An unexpected error occurred. Technical details are hidden for security.",
}: Props) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <p className="max-w-md text-sm text-slate-500">{description}</p>
      {error.digest ? (
        <p className="font-mono text-xs text-slate-400">Ref: {error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
      >
        Try again
      </button>
    </div>
  );
}
