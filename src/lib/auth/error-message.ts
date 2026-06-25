/** Coerce unknown errors (incl. Supabase AuthApiError) to a user-safe string. */
export function extractErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    const trimmed = error.trim();
    return trimmed || "An unexpected error occurred.";
  }

  if (error instanceof Error) {
    const trimmed = error.message?.trim();
    if (trimmed) return trimmed;
  }

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    for (const key of ["message", "msg", "error_description"] as const) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }

  return "An unexpected error occurred.";
}

export function mapSignupDatabaseError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("employer_subscriptions") ||
    lower.includes("database error saving new user")
  ) {
    return "We could not finish setting up your account. Please try again in a moment.";
  }
  if (lower.includes("username") && lower.includes("already taken")) {
    return "auth/username-already-exists";
  }
  if (lower.includes("already registered") || lower.includes("email already")) {
    return "auth/email-already-exists";
  }
  return message;
}
