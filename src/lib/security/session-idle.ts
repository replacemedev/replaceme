/** Idle session policy (app-level, on top of Supabase JWT refresh). */

export const IDLE_COOKIE = "rm_last_active";

/** Default idle timeout: 7 days */
export const IDLE_TIMEOUT_MS = 7 * 24 * 60 * 60 * 1000;

/** Admin idle timeout: 12 hours */
export const ADMIN_IDLE_TIMEOUT_MS = 12 * 60 * 60 * 1000;

export function isSessionIdle(
  lastActiveMs: number | null,
  isAdmin: boolean,
  now = Date.now()
): boolean {
  if (lastActiveMs == null || Number.isNaN(lastActiveMs)) return false;
  const limit = isAdmin ? ADMIN_IDLE_TIMEOUT_MS : IDLE_TIMEOUT_MS;
  return now - lastActiveMs > limit;
}
