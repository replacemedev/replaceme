import { createAdminClient } from "@/lib/supabase/server";
import { safeError, safeWarn } from "@/utils/logger";
import { createResendClient, getResendFromEmail } from "@/lib/server/resend/client";
import type { Database, Json } from "@/types/database";

type UserRole = Database["public"]["Enums"]["user_role"];

export type EmailSendKind = "transactional" | "broadcast";

export type EmailTierSlug = "discovery" | "starter" | "growth" | "scale";
export type EmailTierLabel = "Discovery" | "Starter" | "Growth" | "Scale";

function labelForSlug(slug: EmailTierSlug): EmailTierLabel {
  switch (slug) {
    case "discovery":
      return "Discovery";
    case "starter":
      return "Starter";
    case "growth":
      return "Growth";
    case "scale":
      return "Scale";
  }
}

function plainTextFallback(html: string, subject: string): string {
  const stripped = html
    .replaceAll(/<br\s*\/?>/gi, "\n")
    .replaceAll(/<\/p>/gi, "\n\n")
    .replaceAll(/<[^>]*>/g, "")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .trim();
  return stripped || subject;
}

export async function sendTransactionalEmail(input: {
  templateKey: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string | string[];
  userId?: string | null;
  role?: UserRole | null;
  tierSlug?: EmailTierSlug | null;
  tags?: Record<string, string>;
  idempotencyKey: string;
}): Promise<{ success: true; messageId: string } | { success: false; error: string }> {
  try {
    const to = input.to.trim();
    if (!to || !to.includes("@")) {
      return { success: false, error: "Invalid recipient email address." };
    }

    const admin = await createAdminClient();
    const resend = createResendClient();
    const from = getResendFromEmail();
    const text = input.text?.trim() || plainTextFallback(input.html, input.subject);

    const tierSlug = input.tierSlug ?? null;
    const tierLabel = tierSlug ? labelForSlug(tierSlug) : null;

    // 1) Best-effort pre-log — never block delivery on logging failures.
    let messageRowId: string | null = null;
    const { data: messageRow, error: insertError } = await admin
      .from("email_messages")
      .insert({
        provider: "resend",
        kind: "transactional",
        template_key: input.templateKey,
        to_email: to,
        subject: input.subject,
        user_id: input.userId ?? null,
        role: input.role ?? null,
        tier_slug: tierSlug,
        tier_label: tierLabel,
        status: "queued",
        tags: (input.tags ?? {}) as unknown as Json,
        last_event_at: null,
      })
      .select("id")
      .maybeSingle();

    if (insertError || !messageRow?.id) {
      safeWarn("sendTransactionalEmail: email_messages insert failed; sending anyway", {
        templateKey: input.templateKey,
        to,
        error: insertError?.message ?? "no_row",
      });
    } else {
      messageRowId = messageRow.id;
    }

    // 2) Send with Resend (html + text required for reliable clients).
    const { data, error } = await resend.emails.send(
      {
        from,
        to: [to],
        subject: input.subject,
        html: input.html,
        text,
        ...(input.replyTo ? { replyTo: input.replyTo } : {}),
        tags: Object.entries(input.tags ?? {}).map(([name, value]) => ({
          name,
          value,
        })),
      },
      {
        idempotencyKey: input.idempotencyKey.slice(0, 256),
      }
    );

    if (error || !data?.id) {
      if (messageRowId) {
        await admin
          .from("email_messages")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
            last_event_at: new Date().toISOString(),
          })
          .eq("id", messageRowId);
      }
      return {
        success: false,
        error: error?.message ?? "Resend failed to send email.",
      };
    }

    // 3) Store provider message id + mark sent
    if (messageRowId) {
      await admin
        .from("email_messages")
        .update({
          provider_message_id: data.id,
          status: "sent",
          last_event_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", messageRowId);
    }

    return { success: true, messageId: data.id };
  } catch (err) {
    safeError("sendTransactionalEmail:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send email.",
    };
  }
}
