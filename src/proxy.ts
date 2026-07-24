import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/server/auth/middleware";
import {
  buildCspDirectives,
  CSP_REPORT_TO_HEADER,
  getCspReportUri,
  getEnforceCspMode,
  shouldSendReportOnlyCsp,
} from "@/lib/security/csp";
import {
  isMaintenanceBypassPath,
  isMaintenanceMode,
} from "@/lib/security/feature-flags";

function applyCspHeaders(response: NextResponse, nonce: string) {
  const isDev = process.env.NODE_ENV === "development";
  const reportUri = getCspReportUri();
  const enforceMode = getEnforceCspMode();

  const enforce = buildCspDirectives({
    mode: enforceMode,
    nonce: enforceMode === "nonce" ? nonce : undefined,
    isDev,
    reportUri,
  });

  response.headers.set("Content-Security-Policy", enforce);
  response.headers.set("Report-To", CSP_REPORT_TO_HEADER);
  response.headers.set("Reporting-Endpoints", `csp-endpoint="${reportUri}"`);

  if (shouldSendReportOnlyCsp()) {
    const reportOnly = buildCspDirectives({
      mode: "nonce",
      nonce,
      isDev,
      reportUri,
    });
    response.headers.set("Content-Security-Policy-Report-Only", reportOnly);
  }

  response.headers.set("x-nonce", nonce);
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Inbound provider webhooks (Resend/Stripe): never run auth redirects or
  // session refresh. Webhook POSTs also will not follow 308s (e.g. apex→www),
  // so endpoints must be registered on the canonical host that serves 200.
  if (pathname.startsWith("/api/webhooks/")) {
    return NextResponse.next();
  }

  if (isMaintenanceMode() && !isMaintenanceBypassPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/maintenance";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const requestWithNonce = new NextRequest(request, {
    headers: requestHeaders,
  });

  const response = await updateSession(requestWithNonce);
  applyCspHeaders(response, nonce);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/webhooks (Resend/Stripe — must not redirect; providers ignore 308 on POST)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/webhooks/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
