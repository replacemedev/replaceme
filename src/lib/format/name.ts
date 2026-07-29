/** Formats a legal display name from first/middle/last/suffix parts. */
export function formatFullName(
  firstName: string | null | undefined,
  middleOrLastName: string | null | undefined,
  lastName?: string | null | undefined,
  suffix?: string | null | undefined
): string {
  // Legacy 2-arg: (first, last)
  if (lastName === undefined) {
    return [firstName?.trim(), middleOrLastName?.trim()].filter(Boolean).join(" ");
  }

  return [
    firstName?.trim(),
    middleOrLastName?.trim(),
    lastName?.trim(),
    suffix?.trim(),
  ]
    .filter(Boolean)
    .join(" ");
}
