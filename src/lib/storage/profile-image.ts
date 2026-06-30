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

/** Map Supabase/storage errors to plain-language copy for toasts. */
export function mapProfileImageUploadError(
  raw: string | undefined,
  kind: "avatar" | "logo" = "avatar"
): string {
  const label = kind === "logo" ? "logo" : "photo";
  if (!raw?.trim()) {
    return `We couldn't upload your ${label}. Please try again.`;
  }

  const lower = raw.toLowerCase();

  if (
    lower.includes("row-level security") ||
    lower.includes("rls") ||
    lower.includes("permission") ||
    lower.includes("not authorized")
  ) {
    return `We couldn't save your ${label}. Please sign out, sign back in, and try again.`;
  }

  if (lower.includes("already exist") || lower.includes("duplicate")) {
    return `Your ${label} is being updated — please try once more.`;
  }

  if (
    lower.includes("maximum") ||
    lower.includes("too large") ||
    lower.includes("payload") ||
    lower.includes("413")
  ) {
    return profileImageSizeError();
  }

  if (
    lower.includes("mime") ||
    lower.includes("not allowed") ||
    lower.includes("invalid") ||
    lower.includes("file type")
  ) {
    return "Only JPG and PNG files are allowed.";
  }

  if (lower.includes("empty") || lower.includes("0 bytes")) {
    return "That file looks empty. Please choose a different image.";
  }

  return `We couldn't upload your ${label}. Please use a JPG or PNG up to ${profileImageMaxMbLabel()}.`;
}
