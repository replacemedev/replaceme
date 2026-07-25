import { NextResponse, type NextRequest } from "next/server";
import { safeError } from "@/utils/logger";
import { remindAdminsDiscoveryJobSla } from "@/lib/server/privacy/job-moderation-sla-remind";

export const runtime = "nodejs";

function assertCronAuth(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}`;
}

/**
 * Reminds admins about Discovery jobs nearing / past the 2-day review SLA.
 * Never auto-publishes — paid plans stay instant; Discovery stays human-gated.
 *
 * Schedule (Vercel Cron): daily 0 2 * * * (UTC).
 * @see https://vercel.com/docs/cron-jobs
 */
export async function GET(request: NextRequest) {
  if (!assertCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await remindAdminsDiscoveryJobSla();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    safeError("job-moderation-sla:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
