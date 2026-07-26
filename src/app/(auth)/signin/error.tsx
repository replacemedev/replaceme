"use client";

import { RouteErrorFallback } from "@/components/shared/RouteErrorFallback";

export default function SignInError({
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
      title="Authentication service temporarily unavailable"
      description="We could not load the sign-in form. Reload to try again, or go back and return in a moment."
      actionLabel="Reload sign-in"
    />
  );
}
