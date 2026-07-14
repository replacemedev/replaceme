"use client";

import { RouteErrorFallback } from "@/components/shared/RouteErrorFallback";

export default function PublicError({
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
      title="Could not load this page"
      description="Something went wrong while loading this page. Please try again."
    />
  );
}
