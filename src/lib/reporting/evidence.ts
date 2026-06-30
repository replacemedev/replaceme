export const REPORT_EVIDENCE_MAX_BYTES = 5 * 1024 * 1024;
export const REPORT_EVIDENCE_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
] as const;

export function normalizeReportEvidenceMime(mimeType: string): string | null {
  if (mimeType === "image/jpg") return "image/jpeg";
  if (
    REPORT_EVIDENCE_ALLOWED_TYPES.includes(
      mimeType as (typeof REPORT_EVIDENCE_ALLOWED_TYPES)[number]
    )
  ) {
    return mimeType === "image/jpg" ? "image/jpeg" : mimeType;
  }
  return null;
}

export function validateReportEvidenceFile(file: File | null): string | null {
  if (!file) return null;
  if (file.size > REPORT_EVIDENCE_MAX_BYTES) {
    return "File must be 5 MB or smaller.";
  }
  if (!normalizeReportEvidenceMime(file.type)) {
    return "Only JPG and PNG files are allowed.";
  }
  return null;
}
