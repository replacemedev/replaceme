"use client";

import { useState, useCallback, useEffect, useMemo, type ReactNode } from "react";
import Image, { type ImageProps } from "next/image";
import {
  getOptimizedImageUrl,
  retinaTransformWidth,
  type OptimizedImageOptions,
} from "@/lib/storage/optimized-image-url";
import { createSupabaseImageLoader } from "@/lib/storage/supabase-image-loader";

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

function isSupabaseStorageUrl(url: string): boolean {
  try {
    const { hostname, pathname } = new URL(url);
    return hostname.endsWith(".supabase.co") && pathname.includes("/storage/v1/");
  } catch {
    return false;
  }
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

  const trimmedSrc = src.trim();
  const useSupabaseLoader = isSupabaseStorageUrl(trimmedSrc);

  const supabaseLoader = useMemo(
    () =>
      createSupabaseImageLoader({
        resize: transform?.resize,
        height: transform?.height,
      }),
    [transform?.resize, transform?.height]
  );

  // Non-Supabase remotes (e.g. Google) keep Next's default optimizer.
  const fallbackSrc = useSupabaseLoader
    ? trimmedSrc
    : (getOptimizedImageUrl(trimmedSrc, {
        width: transform?.width ?? (width ? retinaTransformWidth(width) : 256),
        height:
          transform?.height ??
          (height ? retinaTransformWidth(height) : undefined),
        quality: transform?.quality ?? 75,
        resize: transform?.resize,
      }) ?? trimmedSrc);

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
    | "loader"
    | "quality"
    | "fetchPriority"
    | "onLoad"
    | "onError"
  > = {
    src: fallbackSrc,
    alt,
    className: `${className} transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`,
    sizes,
    priority,
    loading: resolvedLoading,
    quality: transform?.quality ?? 75,
    loader: useSupabaseLoader ? supabaseLoader : undefined,
    fetchPriority: priority ? "high" : undefined,
    onLoad: handleLoad,
    onError: handleError,
  };

  return (
    <span className={`relative block overflow-hidden ${containerClassName}`}>
      {!loaded ? (
        <span
          className="absolute inset-0 animate-pulse bg-slate-200"
          aria-hidden
        />
      ) : null}
      {fill ? (
        <Image key={fallbackSrc} fill {...imageProps} />
      ) : (
        <Image
          key={fallbackSrc}
          width={width!}
          height={height!}
          {...imageProps}
        />
      )}
    </span>
  );
}
