import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export type AppRole = "worker" | "employer" | "admin";

export class AuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthError";
  }
}

export type SessionContext = {
  supabase: SupabaseClient;
  user: User;
};

export type RoleContext = SessionContext & {
  profile: { id: string; role: AppRole };
};

export const getSession = cache(async (): Promise<SessionContext | null> => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return { supabase, user };
});

export async function requireAuth(): Promise<SessionContext> {
  const session = await getSession();
  if (!session) throw new AuthError();
  return session;
}

export async function requireRole(
  role: AppRole | AppRole[]
): Promise<RoleContext> {
  const { supabase, user } = await requireAuth();
  const allowed = Array.isArray(role) ? role : [role];

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (error || !profile || !allowed.includes(profile.role as AppRole)) {
    throw new AuthError(
      `Access denied. ${allowed.join(" or ")} role required.`
    );
  }

  return {
    supabase,
    user,
    profile: { id: profile.id, role: profile.role as AppRole },
  };
}
