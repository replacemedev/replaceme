import { createAdminClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";
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

export async function sendTransactionalEmail(input: {
  templateKey: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  userId?: string | null;
  role?: UserRole | null;
  tierSlug?: EmailTierSlug | null;
  tags?: Record<string, string>;
  idempotencyKey: string;
}): Promise<{ success: true; messageId: string } | { success: false; error: string }> {
  const admin = await createAdminClient();
  const resend = createResendClient();
  const from = getResendFromEmail();

  const tierSlug = input.tierSlug ?? null;
  const tierLabel = tierSlug ? labelForSlug(tierSlug) : null;

  // 1) Pre-log as queued
  const { data: messageRow, error: insertError } = await admin
    .from("email_messages")
    .insert({
      provider: "resend",
      kind: "transactional",
      template_key: input.templateKey,
      to_email: input.to,
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
    .single();

  if (insertError || !messageRow?.id) {
    safeError("sendTransactionalEmail: failed to insert email_messages row", insertError);
    return { success: false, error: "Failed to log email send." };
  }

  // 2) Send with Resend
  const { data, error } = await resend.emails.send({
    from,
    to: [input.to],
    subject: input.subject,
    html: input.html,
    text: input.text,
    tags: Object.entries(input.tags ?? {}).map(([name, value]) => ({ name, value })),
  }, {
    idempotencyKey: input.idempotencyKey,
  });

  if (error || !data?.id) {
    await admin
      .from("email_messages")
      .update({
        status: "failed",
        updated_at: new Date().toISOString(),
        last_event_at: new Date().toISOString(),
      })
      .eq("id", messageRow.id);

    return { success: false, error: error?.message ?? "Resend failed to send email." };
  }

  // 3) Store provider message id + mark sent
  await admin
    .from("email_messages")
    .update({
      provider_message_id: data.id,
      status: "sent",
      last_event_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", messageRow.id);

  return { success: true, messageId: data.id };
}

