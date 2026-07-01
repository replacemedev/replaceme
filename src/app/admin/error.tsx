"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // #region agent log
  useEffect(() => {
    fetch("http://127.0.0.1:7616/ingest/92da0cf0-b581-4b9a-8f33-a2958a515450", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "6b02a8",
      },
      body: JSON.stringify({
        sessionId: "6b02a8",
        runId: "pre-fix",
        hypothesisId: "ALL",
        location: "admin/error.tsx:useEffect",
        message: "admin error boundary caught",
        data: {
          name: error?.name,
          message: error?.message,
          digest: error?.digest,
          stack: error?.stack?.slice(0, 800),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }, [error]);
  // #endregion

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-xl font-bold text-slate-900">Something went wrong</h2>
      <p className="max-w-md text-sm text-slate-500">
        An unexpected error occurred in the admin panel. No technical details are
        shown here for security.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
