/**
 * Shared Supabase public env validation for browser + server factories.
 * Prefer logging + controlled errors over opaque create*Client throws.
 */

export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    console.error(
      "[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Check Vercel Environment Variables."
    );
    return null;
  }

  try {
    // Throws TypeError for malformed URLs (common misconfig / empty string edge cases).
    new URL(url);
  } catch {
    console.error(
      "[supabase] NEXT_PUBLIC_SUPABASE_URL is not a valid URL:",
      url
    );
    return null;
  }

  return { url, anonKey };
}

export function requireSupabasePublicEnv(): SupabasePublicEnv {
  const env = getSupabasePublicEnv();
  if (!env) {
    throw new Error(
      "Authentication service temporarily unavailable. Supabase environment is not configured."
    );
  }
  return env;
}
