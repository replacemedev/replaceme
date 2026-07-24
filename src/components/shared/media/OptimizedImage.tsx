"use client";

import { useState, useCallback, useEffect, type ReactNode } from "react";
import Image, { type ImageProps } from "next/image";
import {
  getOptimizedImageUrl,
  retinaTransformWidth,
  type OptimizedImageOptions,
} from "@/lib/storage/optimized-image-url";

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  /** Defaults to lazy unless priority is set. */
  loading?: "lazy" | "eager";
  className?: string;
  containerClassName?: string;
  transform?: OptimizedImageOptions;
  fallback?: ReactNode;
  onLoadComplete?: () => void;
}

function isSupabaseEdgeTransformed(url: string): boolean {
  return url.includes("/storage/v1/render/image/");
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  priority = false,
  loading,
  className = "object-cover",
  containerClassName = "",
  transform,
  fallback = null,
  onLoadComplete,
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [src]);

  const transformWidth = transform?.width ?? (width ? retinaTransformWidth(width) : 256);
  const resolvedSrc =
    getOptimizedImageUrl(src, {
      width: transformWidth,
      height: transform?.height ?? (height ? retinaTransformWidth(height) : undefined),
      quality: transform?.quality,
      resize: transform?.resize,
    }) ?? src;

  const handleLoad = useCallback(() => {
    setLoaded(true);
    onLoadComplete?.();
  }, [onLoadComplete]);

  const handleError = useCallback(() => {
    setFailed(true);
  }, []);

  if (failed) {
    return (
      <span
        className={`relative flex items-center justify-center overflow-hidden ${containerClassName}`}
        role="img"
        aria-label={alt}
      >
        {fallback}
      </span>
    );
  }

  // Serve transformed assets straight from Supabase Smart CDN — skip Next.js
  // optimizer double-fetch (faster cold loads, higher CDN cache hit rate).
  const serveFromCdn = isSupabaseEdgeTransformed(resolvedSrc);
  const resolvedLoading: ImageProps["loading"] = priority
    ? undefined
    : (loading ?? "lazy");

  const imageProps: Pick<
    ImageProps,
    | "src"
    | "alt"
    | "className"
    | "sizes"
    | "priority"
    | "loading"
    | "unoptimized"
    | "onLoad"
    | "onError"
  > = {
    src: resolvedSrc,
    alt,
    className: `${className} transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`,
    sizes,
    priority,
    loading: resolvedLoading,
    unoptimized: serveFromCdn,
    onLoad: handleLoad,
    onError: handleError,
  };

  return (
    <span className={`relative block overflow-hidden ${containerClassName}`}>
      {!loaded ? (
        <span
          className="absolute inset-0 animate-pulse bg-gray-200"
          aria-hidden
        />
      ) : null}
      {fill ? (
        <Image key={resolvedSrc} fill {...imageProps} />
      ) : (
        <Image key={resolvedSrc} width={width!} height={height!} {...imageProps} />
      )}
    </span>
  );
}
