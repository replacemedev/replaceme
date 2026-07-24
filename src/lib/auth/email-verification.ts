import { createAdminClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";

/** Account settings path used for deferred email verification redirects. */
export function emailVerificationSettingsPath(
  role: "worker" | "employer" | "admin" | string | undefined
): string {
  if (role === "employer") return "/employer/settings/account";
  if (role === "admin") return "/admin/settings";
  return "/worker/settings";
}

export function isEmailVerificationPending(user: {
  email_confirmed_at?: string | null;
  app_metadata?: Record<string, unknown> | null;
}): boolean {
  if (!user.email_confirmed_at) return true;
  return user.app_metadata?.email_verification_pending === true;
}

export async function markEmailVerificationPending(
  userId: string,
  existingAppMetadata: Record<string, unknown> | undefined
) {
  const admin = await createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: {
      ...existingAppMetadata,
      email_verification_pending: true,
    },
  });
  if (error) {
    safeError("[Auth] markEmailVerificationPending failed:", error);
  }
}

export async function clearEmailVerificationPending(userId: string) {
  const admin = await createAdminClient();
  const { data, error: getError } = await admin.auth.admin.getUserById(userId);
  if (getError || !data.user) {
    safeError("[Auth] clearEmailVerificationPending getUser failed:", getError);
    return;
  }
  const { error } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: {
      ...data.user.app_metadata,
      email_verification_pending: false,
    },
  });
  if (error) {
    safeError("[Auth] clearEmailVerificationPending failed:", error);
  }
}
