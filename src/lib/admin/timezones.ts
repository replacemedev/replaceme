/** IANA time zones for staff profile select (Asia/Manila first). */
export function listTimeZones(): string[] {
  try {
    if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl) {
      const zones = (
        Intl as typeof Intl & { supportedValuesOf: (key: string) => string[] }
      ).supportedValuesOf("timeZone");
      return zones.includes("Asia/Manila")
        ? [
            "Asia/Manila",
            ...zones.filter((z) => z !== "Asia/Manila"),
          ]
        : zones;
    }
  } catch {
    // fall through
  }
  return [
    "Asia/Manila",
    "Asia/Singapore",
    "Asia/Tokyo",
    "Asia/Hong_Kong",
    "Australia/Sydney",
    "Europe/London",
    "America/New_York",
    "America/Los_Angeles",
    "UTC",
  ];
}

export function formatTimeZoneLabel(zone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    const offset = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    return offset ? `${zone.replace(/_/g, " ")} (${offset})` : zone.replace(/_/g, " ");
  } catch {
    return zone.replace(/_/g, " ");
  }
}
