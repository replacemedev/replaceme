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

const SIZE_CLASS: Record<AvatarSize, string> = {
  xs: "h-8 w-8",
  sm: "h-12 w-12",
  md: "h-24 w-24",
  lg: "h-32 w-32",
  xl: "h-36 w-36",
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
  const isFluid =
    /(?:^|\s)(?:w-|h-|aspect-)/.test(containerClassName) ||
    containerClassName.includes("w-full") ||
    containerClassName.includes("h-full") ||
    containerClassName.includes("aspect-square");
  const sizeClass = isFluid ? "" : SIZE_CLASS[size];
  const roundClass =
    rounded === "full"
      ? "rounded-full"
      : rounded === "2xl"
        ? "rounded-2xl"
        : "rounded-xl";

  // Safari/WebKit: overflow + rounded on the box; object-cover on the image.
  const boxClass = `relative block shrink-0 overflow-hidden ${sizeClass} ${roundClass} ${containerClassName}`.trim();

  if (!src?.trim()) {
    return (
      <span className={boxClass}>
        {initialsFallback(initials, size, roundClass)}
      </span>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={px}
      height={px}
      sizes={`${px}px`}
      priority={priority}
      className={`w-full h-full object-cover ${className} ${roundClass}`}
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
