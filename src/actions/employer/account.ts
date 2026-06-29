"use server";

import { createClient } from "@/lib/supabase/server";
import { sendPasswordResetLink } from "@/actions/auth";
import { safeError } from "@/utils/logger";

export type EmployerAccountDetails = {
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  email: string | null;
  role: string;
  avatarUrl: string | null;
};

export async function getEmployerAccountDetails(): Promise<EmployerAccountDetails | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) return null;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, last_name, username, email, avatar_url, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "employer") return null;

    return {
      firstName: profile.first_name,
      lastName: profile.last_name,
      username: profile.username,
      email: profile.email ?? user.email ?? null,
      role: profile.role,
      avatarUrl: profile.avatar_url,
    };
  } catch (err) {
    safeError("getEmployerAccountDetails error:", err);
    return null;
  }
}

export async function requestPasswordResetForCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    return { success: false, error: "No email found for your account." };
  }

  return sendPasswordResetLink(user.email);
}
