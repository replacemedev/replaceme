import { NextResponse, type NextRequest } from "next/server";
import { createResendClient } from "@/lib/server/resend/client";
import { createAdminClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";
import type { Json } from "@/types/database";

export const runtime = "nodejs";

type ResendWebhookEvent = {
  type: string;
  created_at?: string;
  data?: Record<string, unknown>;
};

function mapWebhookTypeToStatus(type: string): string | null {
  switch (type) {
    case "email.sent":
      return "sent";
    case "email.delivered":
      return "delivered";
    case "email.delivery_delayed":
      return "delayed";
    case "email.opened":
      return "opened";
    case "email.clicked":
      return "clicked";
    case "email.bounced":
      return "bounced";
    case "email.complained":
      return "complained";
    case "email.failed":
      return "failed";
    case "email.suppressed":
      return "suppressed";
    case "email.scheduled":
      return "scheduled";
    default:
      return null;
  }
}

function parseIso(value: unknown): string {
  if (typeof value === "string" && value.length > 0) return value;
  return new Date().toISOString();
}

export async function POST(request: NextRequest) {
  const resend = createResendClient();

  // IMPORTANT: raw body is required for Svix signature verification.
  const payload = await request.text();

  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signature = request.headers.get("svix-signature");

  if (!id || !timestamp || !signature) {
    return NextResponse.json({ error: "Missing Svix headers" }, { status: 400 });
  }

  let event: ResendWebhookEvent;
  try {
    event = resend.webhooks.verify({
      payload,
      headers: { id, timestamp, signature },
      webhookSecret: process.env.RESEND_WEBHOOK_SECRET!,
    }) as unknown as ResendWebhookEvent;
  } catch (err) {
    safeError("Resend webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Store everything we can; don’t assume presence of fields for every event type.
  const data = (event.data ?? {}) as Record<string, unknown>;
  const emailId = typeof data.email_id === "string" ? data.email_id : null;
  const broadcastId = typeof data.broadcast_id === "string" ? data.broadcast_id : null;
  const occurredAt = parseIso(event.created_at ?? data.created_at);

  try {
    const admin = await createAdminClient();

    // Insert raw event payload for audit/analytics.
    // We don't dedupe with svix-id yet; Resend retries are rare and we keep raw history.
    // If you want strict idempotency, we can add a `svix_id` column + unique index later.
    let messageRowId: string | null = null;

    if (emailId) {
      const { data: msgRow, error: msgErr } = await admin
        .from("email_messages")
        .select("id")
        .eq("provider", "resend")
        .eq("provider_message_id", emailId)
        .maybeSingle();

      if (!msgErr && msgRow?.id) {
        messageRowId = msgRow.id;
      }
    }

    if (messageRowId) {
      await admin.from("email_events").insert({
        message_id: messageRowId,
        provider: "resend",
        provider_message_id: emailId,
        provider_broadcast_id: broadcastId,
        event_type: event.type,
        payload: data as unknown as Json,
        occurred_at: occurredAt,
      });

      const nextStatus = mapWebhookTypeToStatus(event.type);
      if (nextStatus) {
        await admin
          .from("email_messages")
          .update({
            status: nextStatus,
            last_event_at: occurredAt,
            updated_at: new Date().toISOString(),
          })
          .eq("id", messageRowId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    safeError("Resend webhook handler error:", err);
    // Return 200 to prevent retries storm; we’ll see errors in logs.
    return NextResponse.json({ received: true });
  }
}

