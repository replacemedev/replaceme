import { NextResponse, type NextRequest } from "next/server";
import { safeError, safeLog } from "@/utils/logger";
import { autoEraseDueAccounts } from "@/lib/server/privacy/erase-account";
import { autoUnsuspendDueAccounts } from "@/lib/server/privacy/suspend-account";

export const runtime = "nodejs";

function assertCronAuth(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}`;
}

/**
 * Processes due timed unsuspensions and deletion grace-period erasures.
 *
 * Schedule (Vercel Cron): daily (recommend 0 3 * * *).
 */
export async function GET(request: NextRequest) {
  if (!assertCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [unsuspend, erase] = await Promise.all([
      autoUnsuspendDueAccounts(),
      autoEraseDueAccounts(),
    ]);

    safeLog(
      `account-lifecycle: unsuspend processed=${unsuspend.processed} errors=${unsuspend.errors}; erase processed=${erase.processed} errors=${erase.errors}`
    );

    return NextResponse.json({
      success: true,
      unsuspend,
      erase,
    });
  } catch (err) {
    safeError("account-lifecycle:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
