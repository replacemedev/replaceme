/**
 * Safely formats first name, middle name, and last name into a single string.
 * It handles null/undefined middle names cleanly.
 */
export function formatFullName(
  firstName: string | null | undefined,
  middleName: string | null | undefined,
  lastName: string | null | undefined,
  suffix?: string | null | undefined
): string {
  const parts = [
    firstName?.trim(),
    middleName?.trim(),
    lastName?.trim(),
    suffix?.trim(),
  ].filter(Boolean);

  return parts.join(" ");
}
