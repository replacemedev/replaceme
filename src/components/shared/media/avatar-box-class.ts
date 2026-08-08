export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export const AVATAR_SIZE_PX: Record<AvatarSize, number> = {
  xs: 32,
  sm: 48,
  md: 96,
  lg: 128,
  xl: 144,
};

/** Fixed square token — always applied unless container supplies explicit square dims. */
export const AVATAR_SIZE_CLASS: Record<AvatarSize, string> = {
  xs: "size-8 min-h-8 min-w-8",
  sm: "size-12 min-h-12 min-w-12",
  md: "size-24 min-h-24 min-w-24",
  lg: "size-32 min-h-32 min-w-32",
  xl: "size-36 min-h-36 min-w-36",
};

export const AVATAR_TEXT_CLASS: Record<AvatarSize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-3xl",
};

/**
 * True when containerClassName sets its own square box (e.g. h-20 w-20),
 * not merely w-full/h-full fill-of-parent.
 */
export function hasExplicitSquareContainer(containerClassName: string): boolean {
  if (!containerClassName.trim()) return false;
  const tokens = containerClassName.split(/\s+/).filter(Boolean);
  const isFillOnly = (t: string) =>
    t === "w-full" ||
    t === "h-full" ||
    t === "size-full" ||
    /^(?:sm|md|lg|xl|2xl):(?:w|h|size)-full$/.test(t);

  return tokens.some((t) => {
    if (isFillOnly(t)) return false;
    return /^(?:sm|md|lg|xl|2xl):/.test(t)
      ? /^(?:sm|md|lg|xl|2xl):(?:w|h|size|min-w|min-h|aspect)-/.test(t)
      : /^(?:w|h|size|min-w|min-h|aspect)-/.test(t);
  });
}

/** Builds the outer avatar box class list (pure — safe for unit tests). */
export function buildAvatarBoxClass({
  size,
  rounded,
  containerClassName = "",
}: {
  size: AvatarSize;
  rounded: "full" | "2xl" | "xl";
  containerClassName?: string;
}): string {
  const roundClass =
    rounded === "full"
      ? "rounded-full"
      : rounded === "2xl"
        ? "rounded-2xl"
        : "rounded-xl";

  // Keep SIZE_CLASS when only filling a parent; drop it only for explicit overrides.
  const sizeClass = hasExplicitSquareContainer(containerClassName)
    ? ""
    : AVATAR_SIZE_CLASS[size];

  // Safari/WebKit: overflow + rounded on the box; object-cover on the image.
  // shrink-0 + aspect-square are non-negotiable so flex rows cannot ovalize.
  return `relative block shrink-0 aspect-square overflow-hidden ${sizeClass} ${roundClass} ${containerClassName}`.trim();
}
