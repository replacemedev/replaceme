import { ADMIN_INVITE_EXPIRY_DAYS } from "@/lib/admin/capabilities";

export function isInvitePending(row: {
  invited_at?: string | null;
  invite_accepted_at?: string | null;
}): boolean {
  return Boolean(row.invited_at) && !row.invite_accepted_at;
}

export function isInviteExpired(invitedAt: string | null | undefined): boolean {
  if (!invitedAt) return false;
  const invited = new Date(invitedAt).getTime();
  if (Number.isNaN(invited)) return false;
  const expiryMs = ADMIN_INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - invited > expiryMs;
}
