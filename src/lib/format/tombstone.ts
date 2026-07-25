/** Display labels for anonymized / deleted marketplace counterparties. */

export const DELETED_USER_LABEL = "Deleted user";
export const DELETED_COMPANY_LABEL = "Deleted company";

export function displayDeletedUser(
  fullName: string | null | undefined,
  deletedAt: string | null | undefined
): string {
  if (deletedAt) return DELETED_USER_LABEL;
  const trimmed = fullName?.trim();
  return trimmed || "Unknown user";
}

export function displayDeletedCompany(
  companyName: string | null | undefined,
  deletedAt: string | null | undefined,
  isTombstoned?: boolean
): string {
  if (deletedAt || isTombstoned) return DELETED_COMPANY_LABEL;
  const trimmed = companyName?.trim();
  return trimmed || "Unknown company";
}

export function isAnonymizedEmail(email: string | null | undefined): boolean {
  return Boolean(email?.endsWith("@anonymized.invalid"));
}
