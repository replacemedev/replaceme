"use client";

import { OptimizedImage } from "./OptimizedImage";
import { retinaTransformWidth } from "@/lib/storage/optimized-image-url";

export interface LogoImageProps {
  src: string | null | undefined;
  alt: string;
  label: string;
  sizePx?: number;
  sizes?: string;
  priority?: boolean;
  rounded?: "lg" | "xl" | "2xl" | "full";
  colorClass?: string;
  className?: string;
  fit?: "cover" | "contain";
}

export function LogoImage({
  src,
  alt,
  label,
  sizePx = 44,
  sizes,
  priority = false,
  rounded = "xl",
  colorClass = "bg-[#ebfdf2] text-[#006e2f]",
  className = "object-cover",
  fit = "cover",
}: LogoImageProps) {
  const roundClass =
    rounded === "full"
      ? "rounded-full"
      : rounded === "2xl"
        ? "rounded-2xl"
        : rounded === "xl"
          ? "rounded-xl"
          : "rounded-lg";
  const initial = label.trim().charAt(0).toUpperCase() || "?";

  const fallback = (
    <span
      className={`flex h-full w-full items-center justify-center font-bold text-sm ${colorClass} ${roundClass}`}
    >
      {initial}
    </span>
  );

  if (!src?.trim()) {
    return (
      <span className={`relative block h-full w-full overflow-hidden ${roundClass}`}>
        {fallback}
      </span>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      sizes={sizes ?? `${sizePx}px`}
      priority={priority}
      className={`${className} ${roundClass}`}
      containerClassName={`h-full w-full ${roundClass}`}
      transform={{ width: retinaTransformWidth(sizePx), resize: fit, quality: 80 }}
      fallback={fallback}
    />
  );
}
