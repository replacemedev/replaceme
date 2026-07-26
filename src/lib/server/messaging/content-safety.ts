import { createAdminClient } from "@/lib/supabase/server";
import { safeError, safeWarn } from "@/utils/logger";
import type { ChatModerationReasonCode } from "@/lib/reporting/messaging-moderation";

const EMAIL_RE =
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;

/** PH mobile (+63 / 09xx) and common international phone fragments. */
const PHONE_RE =
  /(?:\+?63[\s.-]?|0)9\d{2}[\s.-]?\d{3}[\s.-]?\d{4}|\+?\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/;

const PAYMENT_KEYWORDS = [
  "pay outside",
  "pay off platform",
  "pay off-platform",
  "outside the platform",
  "gcash",
  "g-cash",
  "paypal.me",
  "paypal me",
  "wise.com",
  "send money to",
  "bank transfer to my",
  "direct deposit to",
  "crypto wallet",
  "usdt",
  "venmo",
];

const HARASSMENT_KEYWORDS = [
  "kill yourself",
  "i will hurt you",
  "i'll hurt you",
  "rape you",
];

export type ContentSafetyHit = {
  reasonCode: ChatModerationReasonCode;
};

export function scanMessageContent(content: string): ContentSafetyHit | null {
  const text = content.trim();
  if (!text) return null;

  const lower = text.toLowerCase();

  for (const phrase of HARASSMENT_KEYWORDS) {
    if (lower.includes(phrase)) {
      return { reasonCode: "harassment" };
    }
  }

  for (const phrase of PAYMENT_KEYWORDS) {
    if (lower.includes(phrase)) {
      return { reasonCode: "payment_circumvention" };
    }
  }

  if (EMAIL_RE.test(text) || PHONE_RE.test(text)) {
    return { reasonCode: "contact_info" };
  }

  return null;
}

/**
 * Best-effort system flag after a message is sent. Fail-open so delivery
 * is never blocked by moderation infra.
 */
export async function maybeFlagMessageForSafety(input: {
  threadId: string;
  messageId: string;
  content: string;
}): Promise<void> {
  try {
    const hit = scanMessageContent(input.content);
    if (!hit) return;

    const admin = await createAdminClient();
    const { error } = await admin.from("chat_moderation_flags").insert({
      thread_id: input.threadId,
      flagged_message_id: input.messageId,
      source: "system",
      reason_code: hit.reasonCode,
      status: "open",
    });

    if (error) {
      // Unique index may reject duplicate open system flags — expected.
      if (error.code === "23505") return;
      safeWarn("maybeFlagMessageForSafety: insert failed", {
        threadId: input.threadId,
        message: error.message,
      });
    }
  } catch (err) {
    safeError("maybeFlagMessageForSafety:", err);
  }
}
