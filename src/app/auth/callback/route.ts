import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { resolveSafeRedirectOrigin } from "@/lib/auth/safe-redirect-origin";
import { sanitizeRedirectPath } from "@/lib/auth/safe-callback-url";
import {
  clearEmailVerificationPending,
  emailVerificationSettingsPath,
} from "@/lib/auth/email-verification";
import { isAppRole } from "@/lib/auth/role";

function authFailureRedirect(request: NextRequest): NextResponse {
  const url = new URL("/signin", resolveSafeRedirectOrigin(request));
  url.searchParams.set("error", "auth_callback_failed");
  return NextResponse.redirect(url);
}

function createSupabaseWithResponse(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  let response = NextResponse.next();

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

  return {
    supabase,
    attachRedirect(url: string | URL) {
      const redirect = NextResponse.redirect(url);
      response.cookies.getAll().forEach((cookie) => {
        redirect.cookies.set(cookie);
      });
      response = redirect;
      return redirect;
    },
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = searchParams.get("next");

  if (!code) {
    return authFailureRedirect(request);
  }

  const origin = resolveSafeRedirectOrigin(request);
  const isSignup = type === "signup";
  const isRecovery = type === "recovery" || next === "/update-password";

  const cookieStore = await cookies();
  const { supabase, attachRedirect } = createSupabaseWithResponse(cookieStore);

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return authFailureRedirect(request);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isSignup && user) {
    await clearEmailVerificationPending(user.id);
    const role =
      (typeof user.app_metadata?.role === "string" && user.app_metadata.role) ||
      (typeof user.user_metadata?.role === "string" && user.user_metadata.role) ||
      undefined;
    const settingsPath = emailVerificationSettingsPath(
      isAppRole(role) ? role : "worker"
    );
    const safeNext = sanitizeRedirectPath(next, settingsPath);
    const url = new URL(safeNext, origin);
    url.searchParams.set("confirmed", "email");
    return attachRedirect(url);
  }

  if (isRecovery) {
    return attachRedirect(`${origin}/update-password`);
  }

  const safeNext = sanitizeRedirectPath(next, "");
  if (safeNext) {
    return attachRedirect(`${origin}${safeNext}`);
  }

  await supabase.auth.signOut();
  return attachRedirect(`${origin}/signin`);
}
