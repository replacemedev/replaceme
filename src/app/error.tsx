"use client";

import { RouteErrorFallback } from "@/components/shared/RouteErrorFallback";

export default function GlobalAppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorFallback
      error={error}
      reset={reset}
      title="Something went wrong"
      description="We could not load this page. Please try again."
    />
  );
}
