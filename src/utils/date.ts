/**
 * Formats a date/time string, ISO string, or Date object into a readable format
 * with an explicit timezone offset, e.g., "Friday, July 10, 2026 at 9:29 PM (GMT+8)"
 */
export function formatDateTimeWithTimezone(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  // Format date parts
  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const parts = formatter.formatToParts(date);
  let weekday = "";
  let month = "";
  let day = "";
  let year = "";
  let hour = "";
  let minute = "";
  let dayPeriod = "";

  for (const part of parts) {
    if (part.type === "weekday") weekday = part.value;
    else if (part.type === "month") month = part.value;
    else if (part.type === "day") day = part.value;
    else if (part.type === "year") year = part.value;
    else if (part.type === "hour") hour = part.value;
    else if (part.type === "minute") minute = part.value;
    else if (part.type === "dayPeriod") dayPeriod = part.value;
  }

  // Get timezone offset string: e.g., GMT+8, GMT-4
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absOffsetMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absOffsetMinutes / 60);
  const minutes = absOffsetMinutes % 60;
  const tzString = `GMT${sign}${hours}${minutes !== 0 ? `:${minutes.toString().padStart(2, "0")}` : ""}`;

  return `${weekday}, ${month} ${day}, ${year} at ${hour}:${minute} ${dayPeriod} (${tzString})`;
}
