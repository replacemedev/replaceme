import type { SupabaseClient } from "@supabase/supabase-js";

type ProfileImageKind = "avatar" | "logo";

/**
 * Delete every prior image for this user in the bucket, then upload a new
 * versioned object. Avoids upsert + CDN/transform cache serving stale bytes
 * at a fixed path like logo.png.
 */
export async function replaceStorageImage(
  admin: SupabaseClient,
  bucket: string,
  userId: string,
  kind: ProfileImageKind,
  fileBuffer: ArrayBuffer,
  mimeType: string,
  extension: "png" | "jpg"
): Promise<{ publicUrl: string; storagePath: string } | { error: string }> {
  const version = Date.now();
  const storagePath = `${userId}/${kind}-${version}.${extension}`;

  const { data: existingFiles, error: listError } = await admin.storage
    .from(bucket)
    .list(userId, { limit: 100 });

  if (listError) {
    return { error: listError.message };
  }

  const legacyNames = new Set([
    `${kind}.png`,
    `${kind}.jpg`,
    `${kind}.jpeg`,
  ]);

  const pathsToRemove = (existingFiles ?? [])
    .filter(
      (entry) =>
        legacyNames.has(entry.name) || entry.name.startsWith(`${kind}-`)
    )
    .map((entry) => `${userId}/${entry.name}`);

  if (pathsToRemove.length > 0) {
    const { error: removeError } = await admin.storage
      .from(bucket)
      .remove(pathsToRemove);

    if (removeError) {
      return { error: removeError.message };
    }

    const { data: afterRemove } = await admin.storage
      .from(bucket)
      .list(userId, { limit: 100 });

    const stillPresent = (afterRemove ?? []).some(
      (entry) =>
        legacyNames.has(entry.name) || entry.name.startsWith(`${kind}-`)
    );

    if (stillPresent) {
      return {
        error:
          "Could not remove the previous image. Please try again in a moment.",
      };
    }
  }

  const { error: uploadError } = await admin.storage
    .from(bucket)
    .upload(storagePath, new Uint8Array(fileBuffer), {
      contentType: mimeType,
      upsert: false,
      // Versioned paths (`kind-${Date.now()}`) — long browser TTL is safe and
      // cuts repeat egress. Supabase Smart CDN still invalidates on delete.
      cacheControl: "31536000",
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data: publicUrlData } = admin.storage
    .from(bucket)
    .getPublicUrl(storagePath);

  return {
    publicUrl: `${publicUrlData.publicUrl}?v=${version}`,
    storagePath,
  };
}

/** Extract `{userId}/file.ext` from a stored public URL (ignores query string). */
export function storagePathFromPublicUrl(
  url: string,
  bucket: string
): string | null {
  const marker = `/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length).split("?")[0] ?? null;
}
