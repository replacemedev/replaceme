import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { EmailOtpType } from "@supabase/supabase-js";
import { resolveSafeRedirectOrigin } from "@/lib/auth/safe-redirect-origin";
import { sanitizeRedirectPath } from "@/lib/auth/safe-callback-url";
import {
  clearEmailVerificationPending,
  emailVerificationSettingsPath,
} from "@/lib/auth/email-verification";
import { isAppRole } from "@/lib/auth/role";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");

  const origin = resolveSafeRedirectOrigin(request);
  const failureUrl = new URL("/signin", origin);
  failureUrl.searchParams.set("error", "auth_callback_failed");

  if (!tokenHash || !type) {
    return NextResponse.redirect(failureUrl);
  }

  const cookieStore = await cookies();
  let redirectPath =
    type === "recovery" || next === "/update-password"
      ? "/update-password"
      : sanitizeRedirectPath(next, "/signin");

  const response = NextResponse.redirect(new URL(redirectPath, origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (error) {
    return NextResponse.redirect(failureUrl);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (type === "signup" || type === "email") {
    if (user) {
      await clearEmailVerificationPending(user.id);
      const role =
        (typeof user.app_metadata?.role === "string" &&
          user.app_metadata.role) ||
        (typeof user.user_metadata?.role === "string" &&
          user.user_metadata.role) ||
        undefined;
      const settingsPath = emailVerificationSettingsPath(
        isAppRole(role) ? role : "worker"
      );
      redirectPath = sanitizeRedirectPath(next, settingsPath);
    }

    const successUrl = new URL(redirectPath, origin);
    successUrl.searchParams.set("confirmed", "email");
    const confirmed = NextResponse.redirect(successUrl);
    response.cookies.getAll().forEach((cookie) => {
      confirmed.cookies.set(cookie);
    });
    return confirmed;
  }

  return response;
}
