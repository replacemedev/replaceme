import { redirect } from "next/navigation";
import type { AdminCapability } from "@/lib/admin/capabilities";
import {
  currentAdminHasCapability,
  getCurrentAdminCapabilities,
} from "@/lib/server/auth/require-capability";

/**
 * Page-level capability gate. Redirects to dashboard (or settings if
 * dashboard is also denied) when the moderator lacks access.
 */
export async function requireAdminPageCapability(
  capability: AdminCapability
): Promise<void> {
  const { isSuperAdmin, capabilities } = await getCurrentAdminCapabilities();
  if (isSuperAdmin || capabilities.includes(capability)) return;

  const canDashboard = await currentAdminHasCapability("dashboard");
  redirect(canDashboard ? "/admin/dashboard" : "/admin/settings");
}
