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

export function profileImageMaxMbLabel(): string {
  return `${PROFILE_IMAGE_MAX_BYTES / (1024 * 1024)} MB`;
}
