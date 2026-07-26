/**
 * Admin MFA path + AAL helpers (Supabase Auth TOTP).
 *
 * - Not enrolled: currentLevel=aal1, nextLevel=aal1 → force /admin/mfa-enroll
 * - Enrolled, session not stepped up: current=aal1, next=aal2 → /admin/mfa-challenge
 * - Ready: current=aal2
 */

export const MFA_CHALLENGE_PATH = "/admin/mfa-challenge";
export const MFA_ENROLL_PATH = "/admin/mfa-enroll";

export type AdminMfaAal = {
  currentLevel: string | null;
  nextLevel: string | null;
};

export function isAdminMfaSatisfied(aal: AdminMfaAal | null | undefined): boolean {
  return aal?.currentLevel === "aal2";
}

/** Has at least one verified factor (nextLevel becomes aal2). */
export function isAdminMfaEnrolled(aal: AdminMfaAal | null | undefined): boolean {
  return aal?.nextLevel === "aal2";
}

/**
 * Where an admin should go when MFA is not satisfied for the shell.
 * Returns null when AAL2 is already met.
 */
export function resolveAdminMfaRedirect(
  aal: AdminMfaAal | null | undefined
): typeof MFA_CHALLENGE_PATH | typeof MFA_ENROLL_PATH | null {
  if (isAdminMfaSatisfied(aal)) return null;
  if (isAdminMfaEnrolled(aal)) return MFA_CHALLENGE_PATH;
  return MFA_ENROLL_PATH;
}
