import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { requireSupabasePublicEnv } from "@/lib/supabase/env";

export function createClient() {
  const { url, anonKey } = requireSupabasePublicEnv();
  return createBrowserClient<Database>(url, anonKey);
}
