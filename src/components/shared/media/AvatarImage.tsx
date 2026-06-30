"use client";

import { OptimizedImage } from "./OptimizedImage";
import { retinaTransformWidth } from "@/lib/storage/optimized-image-url";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_PX: Record<AvatarSize, number> = {
  xs: 32,
  sm: 48,
  md: 96,
  lg: 128,
  xl: 144,
};

const TEXT_CLASS: Record<AvatarSize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-3xl",
};

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
      className={`flex h-full w-full items-center justify-center bg-[#ebfdf2] font-bold text-[#006e2f] ${TEXT_CLASS[size]} ${rounded}`}
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
  const px = SIZE_PX[size];
  const roundClass =
    rounded === "full" ? "rounded-full" : rounded === "2xl" ? "rounded-2xl" : "rounded-xl";

  if (!src?.trim()) {
    return (
      <span
        className={`relative block h-full w-full overflow-hidden ${roundClass} ${containerClassName}`}
      >
        {initialsFallback(initials, size, roundClass)}
      </span>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      sizes={`${px}px`}
      priority={priority}
      className={`${className} ${roundClass}`}
      containerClassName={`h-full w-full ${roundClass} ${containerClassName}`}
      transform={{ width: retinaTransformWidth(px), resize: "cover", quality: 80 }}
      fallback={initialsFallback(initials, size, roundClass)}
    />
  );
}
