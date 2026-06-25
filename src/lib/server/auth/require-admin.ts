import { cache } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { requireAuth, AuthError } from "@/lib/server/auth/session";

export class AdminAuthError extends AuthError {
  constructor(message = "Unauthorized: Admin access required") {
    super(message);
    this.name = "AdminAuthError";
  }
}

export const requireAdmin = cache(async (): Promise<{
  supabase: SupabaseClient;
  user: User;
}> => {
  const { supabase, user } = await requireAuth();

  if (user.app_metadata?.role !== "admin") {
    throw new AdminAuthError();
  }

  return { supabase, user };
});

/** @deprecated Use requireAdmin */
export const verifyAdmin = requireAdmin;
