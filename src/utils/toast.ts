import { toast } from "sonner";

/**
 * Checks if the error message looks like a database/SQL/system error,
 * a raw code/status string, or a generic Zod/technical error that wasn't mapped.
 * Returns a friendly, human-readable error message.
 */
export function getFriendlyErrorMessage(
  error: any,
  fallback = "Something went wrong. Please try again or contact support."
): string {
  if (!error) return fallback;

  let message = "";
  if (typeof error === "string") {
    message = error;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "object" && error.message) {
    message = String(error.message);
  } else if (typeof error === "object" && error.error) {
    message = String(error.error);
  } else {
    return fallback;
  }

  // Detect database/technical/raw server errors
  const isTechnical =
    /sql|database|db|query|constraint|relation|violat|foreign key|unique|null value|supabase|postg|fetch|network|500|server error|invalid input|unexpected|internal/i.test(
      message
    ) ||
    message.includes("Error:") ||
    message.includes("Exception") ||
    // detect unmapped zod errors like "Expected number, received string", "Too small", "Invalid enum value"
    /expected|received|too small|invalid enum/i.test(message);

  if (isTechnical) {
    return fallback;
  }

  return message;
}

/**
 * Intercepts technical/raw error messages and displays a human-friendly error toast.
 */
export function showErrorToast(error: any, fallback?: string) {
  const msg = getFriendlyErrorMessage(error, fallback);
  toast.error(msg);
}
