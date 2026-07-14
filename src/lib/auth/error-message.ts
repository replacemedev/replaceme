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

/** Stable auth action error codes for signup / password-reset UX. */
export const AUTH_ERROR = {
  EMAIL_EXISTS: "EMAIL_EXISTS",
  USERNAME_EXISTS: "USERNAME_EXISTS",
  EMAIL_NOT_FOUND: "EMAIL_NOT_FOUND",
} as const;

export type AuthErrorCode = (typeof AUTH_ERROR)[keyof typeof AUTH_ERROR];

export const AUTH_ERROR_MESSAGE: Record<AuthErrorCode, string> = {
  EMAIL_EXISTS: "This email is already registered. Please log in.",
  USERNAME_EXISTS: "This username is already taken. Please choose another one.",
  EMAIL_NOT_FOUND: "No account found with this email address.",
};

export function mapSignupDatabaseError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("employer_subscriptions") ||
    lower.includes("database error saving new user")
  ) {
    return "We could not finish setting up your account. Please try again in a moment.";
  }
  if (
    (lower.includes("username") &&
      (lower.includes("already taken") || lower.includes("already exists"))) ||
    lower.includes("profiles_username_key") ||
    lower.includes("company_profiles_username_key") ||
    lower.includes("unique_username")
  ) {
    return AUTH_ERROR.USERNAME_EXISTS;
  }
  if (
    lower.includes("already registered") ||
    lower.includes("email already") ||
    lower.includes("unique_email") ||
    lower.includes("profiles_email_unique_lower_idx")
  ) {
    return AUTH_ERROR.EMAIL_EXISTS;
  }
  return message;
}
