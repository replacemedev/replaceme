/** Strip cache-buster query params before transform or deduplication. */
export function stripImageCacheBuster(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("v");
    parsed.searchParams.delete("t");
    const qs = parsed.searchParams.toString();
    return qs ? `${parsed.origin}${parsed.pathname}?${qs}` : `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.split("?")[0] ?? url;
  }
}

export type OptimizedImageOptions = {
  width: number;
  height?: number;
  quality?: number;
  resize?: "cover" | "contain" | "fill";
};

const SUPABASE_OBJECT_PUBLIC = "/storage/v1/object/public/";
const SUPABASE_RENDER_PUBLIC = "/storage/v1/render/image/public/";

function isSupabaseStorageUrl(url: string): boolean {
  try {
    const { hostname, pathname } = new URL(url);
    return hostname.endsWith(".supabase.co") && pathname.includes("/storage/v1/");
  } catch {
    return false;
  }
}

function toRenderPath(pathname: string): string | null {
  if (pathname.includes(SUPABASE_RENDER_PUBLIC)) {
    return pathname;
  }
  if (pathname.includes(SUPABASE_OBJECT_PUBLIC)) {
    return pathname.replace(SUPABASE_OBJECT_PUBLIC, SUPABASE_RENDER_PUBLIC);
  }
  return null;
}

/**
 * Request a resized WebP from Supabase Storage edge transforms (public buckets).
 * Non-Supabase URLs are returned unchanged.
 */
export function getOptimizedImageUrl(
  src: string | null | undefined,
  options: OptimizedImageOptions
): string | null {
  if (!src?.trim()) return null;

  const cleaned = stripImageCacheBuster(src.trim());

  if (!isSupabaseStorageUrl(cleaned)) {
    return cleaned;
  }

  try {
    const parsed = new URL(cleaned);
    const renderPath = toRenderPath(parsed.pathname);
    if (!renderPath) return cleaned;

    const height = options.height ?? options.width;
    parsed.pathname = renderPath;
    parsed.search = "";
    parsed.searchParams.set("width", String(Math.round(options.width)));
    parsed.searchParams.set("height", String(Math.round(height)));
    parsed.searchParams.set("resize", options.resize ?? "cover");
    parsed.searchParams.set("quality", String(options.quality ?? 75));
    parsed.searchParams.set("format", "webp");

    return parsed.toString();
  } catch {
    return cleaned;
  }
}

/** Retina-friendly transform width for a CSS pixel size. */
export function retinaTransformWidth(cssPx: number): number {
  return Math.min(Math.round(cssPx * 2), 1200);
}
