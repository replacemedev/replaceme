import type { ImageLoader } from "next/image";
import {
  getOptimizedImageUrl,
  type OptimizedImageOptions,
} from "@/lib/storage/optimized-image-url";

/**
 * Next.js Image loader for Supabase Storage transforms.
 * Appends width/quality (and cover resize) so clients never pull full-res avatars.
 * @see https://supabase.com/docs/guides/storage/serving/image-transformations
 */
export function createSupabaseImageLoader(
  options?: Pick<OptimizedImageOptions, "resize" | "height">
): ImageLoader {
  return ({ src, width, quality }) => {
    return (
      getOptimizedImageUrl(src, {
        width,
        height: options?.height ?? width,
        quality: quality ?? 75,
        resize: options?.resize ?? "cover",
      }) ?? src
    );
  };
}

/** Default cover loader — safe for avatars and most UI thumbnails. */
export const supabaseImageLoader = createSupabaseImageLoader();
