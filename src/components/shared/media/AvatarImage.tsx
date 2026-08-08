"use client";

import { OptimizedImage } from "./OptimizedImage";
import { retinaTransformWidth } from "@/lib/storage/optimized-image-url";
import {
  AVATAR_SIZE_PX,
  AVATAR_TEXT_CLASS,
  buildAvatarBoxClass,
  type AvatarSize,
} from "./avatar-box-class";

export type { AvatarSize } from "./avatar-box-class";
export {
  buildAvatarBoxClass,
  hasExplicitSquareContainer,
} from "./avatar-box-class";

export interface AvatarImageProps {
  src: string | null | undefined;
  alt: string;
  initials: string;
  size?: AvatarSize;
  rounded?: "full" | "2xl" | "xl";
  priority?: boolean;
  className?: string;
  containerClassName?: string;
}

function initialsFallback(initials: string, size: AvatarSize, rounded: string) {
  return (
    <span
      className={`flex h-full w-full items-center justify-center bg-[#ebfdf2] font-bold text-[#006e2f] ${AVATAR_TEXT_CLASS[size]} ${rounded}`}
    >
      {initials}
    </span>
  );
}

export function AvatarImage({
  src,
  alt,
  initials,
  size = "sm",
  rounded = "full",
  priority = false,
  className = "object-cover",
  containerClassName = "",
}: AvatarImageProps) {
  const px = AVATAR_SIZE_PX[size];
  const roundClass =
    rounded === "full"
      ? "rounded-full"
      : rounded === "2xl"
        ? "rounded-2xl"
        : "rounded-xl";
  const boxClass = buildAvatarBoxClass({ size, rounded, containerClassName });

  if (!src?.trim()) {
    return (
      <span className={boxClass}>
        {initialsFallback(initials, size, roundClass)}
      </span>
    );
  }

  // Always use fill + object-cover so the image covers the rounded box
  // (fixed width/height attrs leave gaps inside sized wrappers).
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      sizes={`${px}px`}
      priority={priority}
      className={`h-full w-full object-cover ${className} ${roundClass}`.trim()}
      containerClassName={boxClass}
      transform={{
        width: retinaTransformWidth(px),
        height: retinaTransformWidth(px),
        resize: "cover",
        quality: 75,
      }}
      fallback={initialsFallback(initials, size, roundClass)}
    />
  );
}
