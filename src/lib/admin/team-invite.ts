import { randomBytes } from "node:crypto";
import { getSiteUrl } from "@/lib/auth/site-url";
import {
  ADMIN_INVITE_EXPIRY_DAYS,
  sanitizeModeratorCapabilities,
  type AdminCapability,
} from "@/lib/admin/capabilities";
import {
  escapeHtml,
  renderEmailLayout,
} from "@/lib/server/email/email-templates";
import { sendTransactionalEmail } from "@/lib/server/email/mailer";
import { createAdminClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";

export { isInviteExpired, isInvitePending } from "@/lib/admin/invite-status";

export function randomInvitePassword(): string {
  return randomBytes(24).toString("base64url");
}

export async function sendAdminInviteEmail(input: {
  email: string;
  fullName: string;
  userId: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const admin = await createAdminClient();
  const { data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "recovery",
      email: input.email,
      options: {
        redirectTo: `${getSiteUrl()}/auth/callback?type=recovery&next=${encodeURIComponent("/update-password")}`,
      },
    });

  const tokenHash = linkData?.properties?.hashed_token;
  if (linkError || !tokenHash) {
    safeError("[AdminTeam] invite generateLink failed:", linkError);
    return {
      success: false,
      error: linkError?.message ?? "Failed to generate invite link.",
    };
  }

  const inviteHref = `${getSiteUrl()}/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=recovery&next=${encodeURIComponent("/update-password")}`;
  const safeName = escapeHtml(input.fullName.trim() || "there");

  const bodyHtml = `
      <p style="margin:0 0 14px 0;">Hi ${safeName},</p>
      <p style="margin:0 0 14px 0;">You've been invited to the <strong>Replaceme</strong> admin portal as a team member.</p>
      <p style="margin:0 0 18px 0;">Set your password with the secure link below. The invite expires in <strong>${ADMIN_INVITE_EXPIRY_DAYS} days</strong>. After signing in, you'll complete MFA before accessing admin tools.</p>
      <p style="margin:0 0 18px 0;">
        <a href="${escapeHtml(inviteHref)}" style="display:inline-block;background:#006e2f;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:12px;font-weight:700;font-size:14px;letter-spacing:-0.01em;line-height:1.2;">Accept invite &amp; set password</a>
      </p>
      <p style="margin:0;font-size:13px;color:#64748b;line-height:1.55;">
        If you weren't expecting this invite, ignore this email or contact support@replaceme.ph.
      </p>
    `;

  const rendered = renderEmailLayout({
    title: "You're invited to Replaceme Admin",
    preheader: "Set your password to join the admin team.",
    bodyHtml,
    footerNote: `This invite expires in ${ADMIN_INVITE_EXPIRY_DAYS} days. Need help? support@replaceme.ph`,
  });

  const sent = await sendTransactionalEmail({
    templateKey: "admin.team_invite",
    to: input.email,
    subject: "You're invited to Replaceme Admin",
    html: rendered.html,
    text: rendered.text,
    userId: input.userId,
    role: "admin",
    idempotencyKey: `admin-invite:${input.userId}:${Math.floor(Date.now() / 60_000)}`,
  });

  if (!sent.success) {
    return { success: false, error: sent.error };
  }
  return { success: true };
}

export function capabilitiesForRole(
  adminRole: "moderator" | "superadmin",
  raw: readonly string[] | undefined
): AdminCapability[] {
  if (adminRole === "superadmin") return [];
  return sanitizeModeratorCapabilities(raw);
}
