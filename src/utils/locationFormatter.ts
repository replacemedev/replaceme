/**
 * Formats granular location components into a standard comma-separated address.
 * Omits null/undefined/empty components to prevent dangling commas.
 */
export function formatLocation(
  addressLine1: string | null | undefined,
  city: string | null | undefined,
  province: string | null | undefined,
  region: string | null | undefined
): string {
  const parts = [
    addressLine1?.trim(),
    city?.trim(),
    province?.trim(),
    region?.trim(),
  ].filter(Boolean);

  return parts.join(", ");
}
