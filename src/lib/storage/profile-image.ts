/** Shared limits for worker profile photos and employer company logos. */
export const PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const PROFILE_IMAGE_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
] as const;

export function normalizeProfileImageMime(mimeType: string): string | null {
  if (mimeType === "image/jpg") return "image/jpeg";
  if (
    PROFILE_IMAGE_ALLOWED_TYPES.includes(
      mimeType as (typeof PROFILE_IMAGE_ALLOWED_TYPES)[number]
    )
  ) {
    return mimeType === "image/jpg" ? "image/jpeg" : mimeType;
  }
  return null;
}

/** Browsers often omit file.type; infer from extension before rejecting. */
export function resolveProfileImageMime(file: File): string | null {
  const fromType = normalizeProfileImageMime(file.type);
  if (fromType) return fromType;

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  return null;
}

export function profileImageSizeError(): string {
  return `File exceeds ${profileImageMaxMbLabel()} maximum.`;
}

export function profileImageMaxMbLabel(): string {
  return `${PROFILE_IMAGE_MAX_BYTES / (1024 * 1024)} MB`;
}

/** Format + size only — no pixel dimension requirements (common SaaS pattern). */
export function profileImageHelperText(): string {
  return `JPG or PNG, up to ${profileImageMaxMbLabel()}.`;
}

export function profileImageHelperTextOptional(): string {
  return `Optional. ${profileImageHelperText()}`;
}

export function companyLogoHelperText(): string {
  return profileImageHelperText();
}
