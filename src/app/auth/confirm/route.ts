import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { EmailOtpType } from "@supabase/supabase-js";
import { resolveSafeRedirectOrigin } from "@/lib/auth/safe-redirect-origin";
import { sanitizeRedirectPath } from "@/lib/auth/safe-callback-url";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");

  const origin = resolveSafeRedirectOrigin(request);
  const destinationPath =
    type === "recovery" || next === "/update-password"
      ? "/update-password"
      : sanitizeRedirectPath(next, "/signin");

  const successUrl = new URL(destinationPath, origin);
  const failureUrl = new URL("/signin", origin);
  failureUrl.searchParams.set("error", "auth_callback_failed");

  if (!tokenHash || !type) {
    return NextResponse.redirect(failureUrl);
  }

  const cookieStore = await cookies();
  const response = NextResponse.redirect(successUrl);

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

  if (type === "signup") {
    await supabase.auth.signOut();
    const signedOut = NextResponse.redirect(
      new URL("/signin?confirmed=email", origin)
    );
    return signedOut;
  }

  return response;
}
