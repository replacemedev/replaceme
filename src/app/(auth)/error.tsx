"use client";

import { RouteErrorFallback } from "@/components/shared/RouteErrorFallback";

export default function AuthError({
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
      title="Sign-in unavailable"
      description="Something went wrong with authentication. Please try again."
    />
  );
}
