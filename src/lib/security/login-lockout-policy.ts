/**
 * Progressive login lockout (OWASP / Cognito-style).
 * After FREE_ATTEMPTS failures: lock for min(2^(n-FREE), MAX) seconds.
 * Silent to clients — never reveal lock state (enumeration-safe).
 */

export const LOCKOUT_FREE_ATTEMPTS = 5;
export const LOCKOUT_MAX_SECONDS = 15 * 60; // 15 minutes
export const LOCKOUT_COUNTER_TTL_SECONDS = 60 * 60; // 1 hour observation window

/** Pure: seconds to lock after `failures` consecutive failures (0 = not locked). */
export function lockoutSecondsForFailures(failures: number): number {
  if (failures < LOCKOUT_FREE_ATTEMPTS) return 0;
  const exp = failures - LOCKOUT_FREE_ATTEMPTS; // 0 → 1s, 1 → 2s, …
  const seconds = Math.pow(2, exp);
  return Math.min(seconds, LOCKOUT_MAX_SECONDS);
}

export function failuresKey(accountKey: string): string {
  return `rm:login:fail:${accountKey}`;
}

export function lockedUntilKey(accountKey: string): string {
  return `rm:login:locked_until:${accountKey}`;
}

/** Normalize email/username for lockout keys. */
export function normalizeLockoutAccountKey(identifier: string): string {
  return identifier.trim().toLowerCase();
}
