"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/server/auth/require-super-admin";
import { createAdminClient } from "@/lib/supabase/server";
import { createResendClient, getResendFromEmail } from "@/lib/server/resend/client";
import { getResendSegmentId, ensureResendSegment, type ResendSegmentKey } from "@/lib/server/resend/segments";
import { safeError } from "@/utils/logger";
import type { Json } from "@/types/database";

const EMAIL_MANAGEMENT_PATH = "/admin/reports/email";

const broadcastSchema = z.object({
  segmentKey: z.enum([
    "role_employer",
    "role_worker",
    "role_admin",
    "tier_discovery",
    "tier_starter",
    "tier_growth",
    "tier_scale",
  ]),
  subject: z.string().trim().min(3).max(140),
  html: z.string().trim().min(30),
  scheduledAt: z.string().trim().optional(),
});

type ActionResult = { success: true } | { success: false; error: string };

export async function createAndSendBroadcast(
  input: z.infer<typeof broadcastSchema>
): Promise<ActionResult> {
  try {
    await requireSuperAdmin();
    const parsed = broadcastSchema.parse(input);

    const resend = createResendClient();
    const from = getResendFromEmail();
    const admin = await createAdminClient();

    const segmentKey = parsed.segmentKey as ResendSegmentKey;

    // Ensure segment exists (will return null if plan limit prevents creation)
    const ensured = await ensureResendSegment(segmentKey);
    const segmentId = ensured ?? (await getResendSegmentId(segmentKey));

    if (!segmentId) {
      return {
        success: false,
        error:
          "Broadcast segment is not available yet. Create it in Resend (or upgrade your plan if you reached the segment limit), then retry.",
      };
    }

    // 1) Create broadcast in Resend (send immediately when `send: true`)
    const { data: broadcast, error } = await resend.broadcasts.create({
      segmentId,
      from,
      subject: parsed.subject,
      html: parsed.html,
      send: true,
      scheduledAt: parsed.scheduledAt,
    });

    if (error || !broadcast?.id) {
      return { success: false, error: error?.message ?? "Failed to create broadcast." };
    }

    // 2) Log broadcast creation in Supabase for admin observability
    const { error: logError } = await admin.from("email_messages").insert({
      provider: "resend",
      kind: "broadcast",
      provider_broadcast_id: broadcast.id,
      subject: parsed.subject,
      template_key: "admin.broadcast",
      status: parsed.scheduledAt ? "scheduled" : "sent",
      tags: { segment_key: segmentKey, segment_id: segmentId } as unknown as Json,
      last_event_at: new Date().toISOString(),
    });

    if (logError) {
      safeError("createAndSendBroadcast: failed to log email_messages", logError);
    }

    revalidatePath(EMAIL_MANAGEMENT_PATH);
    revalidatePath("/admin/audit-log");

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send broadcast.",
    };
  }
}

