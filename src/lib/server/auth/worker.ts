import { createClient } from "@/lib/supabase/server";
import { profileIdFilter } from "@/lib/auth/role";
import { safeError } from "@/utils/logger";

export async function requireWorker() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .or(profileIdFilter(user.id))
    .maybeSingle();

  if (profileError) {
    safeError("[requireWorker] profile lookup failed:", profileError);
    return null;
  }

  if (!profile || profile.role !== "worker") return null;

  return { supabase, user, profile };
}
