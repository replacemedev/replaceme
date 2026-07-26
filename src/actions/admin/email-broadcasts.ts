"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/server/auth/require-super-admin";
import { createAdminClient } from "@/lib/supabase/server";
import {
  createResendClient,
  getResendFromEmail,
} from "@/lib/server/resend/client";
import {
  getResendSegmentId,
  ensureResendSegment,
  type ResendSegmentKey,
} from "@/lib/server/resend/segments";
import {
  assertBroadcastHtmlCompliance,
  getCompanyPhysicalAddress,
  isBroadcastComplianceReady,
} from "@/lib/server/email/email-compliance";
import { renderReactEmail } from "@/lib/server/email/render-react-email";
import AdminBroadcastEmail from "@emails/admin-broadcast";
import { safeError } from "@/utils/logger";
import type { Json } from "@/types/database";
import { createElement } from "react";

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
  /** Plain-text body for modular template (preferred). */
  body: z.string().trim().min(10).max(8000).optional(),
  /** Advanced HTML path — still compliance-gated. */
  html: z.string().trim().min(30).optional(),
  ctaUrl: z.string().url().optional().or(z.literal("")),
  ctaLabel: z.string().trim().max(60).optional(),
  scheduledAt: z.string().trim().optional(),
});

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function getBroadcastComplianceStatus(): Promise<{
  ready: boolean;
  hasPhysicalAddress: boolean;
}> {
  const address = getCompanyPhysicalAddress();
  return {
    ready: isBroadcastComplianceReady(),
    hasPhysicalAddress: address !== null,
  };
}

export async function previewBroadcastHtml(input: {
  subject: string;
  body: string;
  ctaUrl?: string;
  ctaLabel?: string;
}): Promise<{ success: true; html: string } | { success: false; error: string }> {
  try {
    await requireSuperAdmin();
    const address = getCompanyPhysicalAddress();
    if (!address) {
      return {
        success: false,
        error:
          "Set COMPANY_PHYSICAL_ADDRESS before previewing compliant broadcasts.",
      };
    }
    const { html } = await renderReactEmail(
      createElement(AdminBroadcastEmail, {
        title: input.subject.trim() || "Preview",
        body: input.body,
        physicalAddress: address,
        ctaUrl: input.ctaUrl || undefined,
        ctaLabel: input.ctaLabel || undefined,
      })
    );
    return { success: true, html };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Preview failed.",
    };
  }
}

export async function createAndSendBroadcast(
  input: z.infer<typeof broadcastSchema>
): Promise<ActionResult> {
  try {
    await requireSuperAdmin();
    const parsed = broadcastSchema.parse(input);

    if (!parsed.body && !parsed.html) {
      return {
        success: false,
        error: "Provide a message body (or advanced HTML).",
      };
    }

    let html = parsed.html?.trim() ?? "";

    if (parsed.body?.trim()) {
      const address = getCompanyPhysicalAddress();
      if (!address) {
        return {
          success: false,
          error:
            "Commercial broadcasts are blocked until COMPANY_PHYSICAL_ADDRESS is set (CAN-SPAM).",
        };
      }
      const rendered = await renderReactEmail(
        createElement(AdminBroadcastEmail, {
          title: parsed.subject,
          body: parsed.body,
          physicalAddress: address,
          ctaUrl: parsed.ctaUrl || undefined,
          ctaLabel: parsed.ctaLabel || undefined,
        })
      );
      html = rendered.html;
    }

    const compliance = assertBroadcastHtmlCompliance(html);
    if (!compliance.ok) {
      return { success: false, error: compliance.error };
    }

    const resend = createResendClient();
    const from = getResendFromEmail();
    const admin = await createAdminClient();

    const segmentKey = parsed.segmentKey as ResendSegmentKey;
    const ensured = await ensureResendSegment(segmentKey);
    const segmentId = ensured ?? (await getResendSegmentId(segmentKey));

    if (!segmentId) {
      return {
        success: false,
        error:
          "Broadcast segment is not available yet. Create it in Resend (or upgrade your plan if you reached the segment limit), then retry.",
      };
    }

    const { data: broadcast, error } = await resend.broadcasts.create({
      segmentId,
      from,
      subject: parsed.subject,
      html,
      send: true,
      scheduledAt: parsed.scheduledAt,
    });

    if (error || !broadcast?.id) {
      return {
        success: false,
        error: error?.message ?? "Failed to create broadcast.",
      };
    }

    const { error: logError } = await admin.from("email_messages").insert({
      provider: "resend",
      kind: "broadcast",
      provider_broadcast_id: broadcast.id,
      subject: parsed.subject,
      template_key: "admin.broadcast",
      status: parsed.scheduledAt ? "scheduled" : "sent",
      tags: {
        segment_key: segmentKey,
        segment_id: segmentId,
      } as unknown as Json,
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
