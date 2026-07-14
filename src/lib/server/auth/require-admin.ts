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

  // Enforce AAL2 when MFA is enrolled — layout alone is not enough for Server Actions.
  const { data: aalData } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aalData?.nextLevel === "aal2" && aalData?.currentLevel !== "aal2") {
    throw new AdminAuthError("MFA challenge required before admin actions");
  }

  return { supabase, user };
});

/** @deprecated Use requireAdmin */
export const verifyAdmin = requireAdmin;
