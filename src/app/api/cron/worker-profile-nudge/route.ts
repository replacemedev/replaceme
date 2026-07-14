import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { safeError, safeLog } from "@/utils/logger";
import { notifyWorkerProfileNudge } from "@/actions/email";

export const runtime = "nodejs";

function assertCronAuth(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}`;
}

/**
 * Sends a one-time profile optimization nudge to workers ~48h after signup
 * when skills / ID verification are still incomplete.
 *
 * Schedule (Vercel Cron): every 6 hours (minute 0).
 */
export async function GET(request: NextRequest) {
  if (!assertCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = await createAdminClient();
    const now = Date.now();
    const windowEnd = new Date(now - 48 * 60 * 60 * 1000).toISOString();
    const windowStart = new Date(now - 54 * 60 * 60 * 1000).toISOString();

    const { data: workers, error } = await admin
      .from("profiles")
      .select("id")
      .eq("role", "worker")
      .gte("created_at", windowStart)
      .lte("created_at", windowEnd);

    if (error) throw new Error(error.message);

    let sent = 0;
    let skipped = 0;

    for (const worker of workers ?? []) {
      // Prefer DB idempotency via email_messages for this template key.
      const { data: already } = await admin
        .from("email_messages")
        .select("id")
        .eq("user_id", worker.id)
        .eq("template_key", "worker.profile.optimization_nudge")
        .maybeSingle();

      if (already) {
        skipped += 1;
        continue;
      }

      const result = await notifyWorkerProfileNudge({ workerId: worker.id });
      if (result.success && !result.skipped && result.messageId) {
        sent += 1;
      } else {
        skipped += 1;
      }
    }

    safeLog(`worker-profile-nudge: sent=${sent} skipped=${skipped}`);
    return NextResponse.json({ success: true, sent, skipped });
  } catch (err) {
    safeError("worker-profile-nudge:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
