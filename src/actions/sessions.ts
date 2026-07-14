"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/server/auth/session";
import { emitAuditLog } from "@/lib/server/audit/emit-audit-log";
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
    const { user } = await requireAuth();
    const supabase = await createClient();
    safeLog("[Auth] Revoke other sessions");
    const { error } = await supabase.auth.signOut({ scope: "others" });
    if (error) {
      safeError("[Auth] revokeOtherSessions:", error);
      return { success: false, error: "Could not revoke other sessions. Please try again." };
    }
    await emitAuditLog({
      actionType: "auth.revoke_other_sessions",
      targetType: "user",
      targetId: user.id,
      metadata: { actor_id: user.id, scope: "others" },
    });
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  safeLog("[Auth] Revoke all sessions (global)");
  if (user) {
    await emitAuditLog({
      actionType: "auth.revoke_all_sessions",
      targetType: "user",
      targetId: user.id,
      metadata: { actor_id: user.id, scope: "global" },
    });
  }
  await supabase.auth.signOut({ scope: "global" });
  revalidatePath("/", "layout");
  redirect("/signin?reason=signed_out_everywhere");
}
