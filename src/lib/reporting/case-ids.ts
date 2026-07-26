import { z } from "zod";

export type CaseSource = "user_report" | "legacy_dispute";

export function encodeCasePathId(source: CaseSource, id: string): string {
  return source === "legacy_dispute" ? `legacy-${id}` : id;
}

export function parseCasePathId(caseId: string): {
  source: CaseSource;
  sourceId: string;
} | null {
  if (caseId.startsWith("legacy-")) {
    const sourceId = caseId.slice("legacy-".length);
    if (!z.string().uuid().safeParse(sourceId).success) return null;
    return { source: "legacy_dispute", sourceId };
  }
  if (!z.string().uuid().safeParse(caseId).success) return null;
  return { source: "user_report", sourceId: caseId };
}

export function displayCaseId(source: CaseSource, id: string): string {
  const prefix = source === "legacy_dispute" ? "LG" : "UR";
  return `${prefix}-${id.slice(0, 8).toUpperCase()}`;
}
