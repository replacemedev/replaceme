import { ZodError } from "zod";
import { safeError } from "@/utils/logger";
import { AuthError } from "@/lib/server/auth/session";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

export const GENERIC_ACTION_ERROR =
  "An unexpected error occurred. Please try again.";

export function formatZodError(error: ZodError): string {
  return error.issues[0]?.message ?? "Invalid input.";
}

export function fail(error: string): ActionResult<never> {
  return { success: false, error };
}

export function ok<T = void>(data?: T): ActionResult<T> {
  return data === undefined
    ? ({ success: true } as ActionResult<T>)
    : { success: true, data };
}

/**
 * Wraps a server action body with Zod-aware and stack-trace-safe error handling.
 * Never surfaces raw Error.message or stack traces to the client.
 */
export async function runAction<T>(
  label: string,
  fn: () => Promise<ActionResult<T>>
): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ZodError) {
      return fail(formatZodError(err));
    }
    if (err instanceof AuthError) {
      return fail(err.message);
    }
    safeError(`${label}:`, err);
    return fail(GENERIC_ACTION_ERROR);
  }
}
