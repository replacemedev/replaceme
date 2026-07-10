"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/server/auth/session";
import { safeError, safeLog } from "@/utils/logger";

export type SessionActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

/**
 * End all other sessions; keep this device signed in.
 * Supabase: signOut({ scope: 'others' })
 */
export async function revokeOtherSessions(): Promise<SessionActionResult> {
  try {
    await requireAuth();
    const supabase = await createClient();
    safeLog("[Auth] Revoke other sessions");
    const { error } = await supabase.auth.signOut({ scope: "others" });
    if (error) {
      safeError("[Auth] revokeOtherSessions:", error);
      return { success: false, error: "Could not revoke other sessions. Please try again." };
    }
    revalidatePath("/", "layout");
    return {
      success: true,
      message: "Signed out of all other devices. This device stays signed in.",
    };
  } catch (err) {
    safeError("[Auth] revokeOtherSessions unexpected:", err);
    return { success: false, error: "Could not revoke other sessions. Please try again." };
  }
}

/**
 * End every session including this one, then redirect to sign-in.
 * Supabase: signOut({ scope: 'global' })
 */
export async function revokeAllSessionsAndSignOut(): Promise<void> {
  const supabase = await createClient();
  safeLog("[Auth] Revoke all sessions (global)");
  await supabase.auth.signOut({ scope: "global" });
  revalidatePath("/", "layout");
  redirect("/signin?reason=signed_out_everywhere");
}
