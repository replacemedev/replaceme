/** Messaging T&S flag taxonomy (aligned with user-report categories where possible). */

export const CHAT_MODERATION_REASON_CODES = [
  "contact_info",
  "payment_circumvention",
  "harassment",
  "scam_fraud",
  "spam_misleading",
  "other",
] as const;

export type ChatModerationReasonCode =
  (typeof CHAT_MODERATION_REASON_CODES)[number];

export const CHAT_MODERATION_REASON_LABELS: Record<
  ChatModerationReasonCode,
  string
> = {
  contact_info: "Contact Info Shared",
  payment_circumvention: "Off-platform Payment",
  harassment: "Harassment / Abuse",
  scam_fraud: "Scam / Fraud",
  spam_misleading: "Spam / Misleading",
  other: "Other",
};

export const CHAT_MODERATION_SOURCES = ["system", "user_report"] as const;

export type ChatModerationSource = (typeof CHAT_MODERATION_SOURCES)[number];

export const CHAT_MODERATION_SOURCE_LABELS: Record<ChatModerationSource, string> =
  {
    system: "System Flag",
    user_report: "User Report",
  };

export const CHAT_MODERATION_STATUSES = [
  "open",
  "investigating",
  "dismissed",
  "resolved",
] as const;

export type ChatModerationStatus = (typeof CHAT_MODERATION_STATUSES)[number];

export const CHAT_MODERATION_STATUS_LABELS: Record<
  ChatModerationStatus,
  string
> = {
  open: "Open",
  investigating: "Investigating",
  dismissed: "Dismissed",
  resolved: "Resolved",
};

export function formatChatModerationReason(
  source: ChatModerationSource,
  reasonCode: ChatModerationReasonCode
): string {
  return `${CHAT_MODERATION_SOURCE_LABELS[source]}: ${CHAT_MODERATION_REASON_LABELS[reasonCode]}`;
}

/** Map user-report violation categories onto messaging reason codes. */
export function violationToChatReason(
  violation: string
): ChatModerationReasonCode {
  switch (violation) {
    case "payment_circumvention":
      return "payment_circumvention";
    case "harassment":
      return "harassment";
    case "scam_fraud":
      return "scam_fraud";
    case "spam_misleading":
      return "spam_misleading";
    case "identity_misrepresentation":
    case "wage_dispute":
    case "other":
    default:
      return "other";
  }
}
