import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export class AdminAuthError extends Error {
  constructor(message = "Unauthorized: Admin access required") {
    super(message);
    this.name = "AdminAuthError";
  }
}

export const verifyAdmin = cache(async (): Promise<{
  supabase: SupabaseClient;
  user: User;
}> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    throw new AdminAuthError();
  }

  return { supabase, user };
});
