import { NextResponse, type NextRequest } from "next/server";
import { safeWarn } from "@/utils/logger";

export const runtime = "nodejs";

/**
 * CSP violation reports (enforce + report-only).
 * Accepts both legacy `application/csp-report` and Reporting API JSON.
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    const raw = await request.text();
    if (!raw || raw.length > 64_000) {
      return new NextResponse(null, { status: 204 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return new NextResponse(null, { status: 204 });
    }

    const reports = Array.isArray(parsed)
      ? parsed
      : contentType.includes("csp-report") &&
          typeof parsed === "object" &&
          parsed !== null &&
          "csp-report" in parsed
        ? [(parsed as { "csp-report": unknown })["csp-report"]]
        : [parsed];

    for (const report of reports.slice(0, 20)) {
      safeWarn("CSP violation report", {
        contentType,
        report,
      });
    }
  } catch {
    // Swallow — reporters retry aggressively; never leak internals.
  }

  return new NextResponse(null, { status: 204 });
}
