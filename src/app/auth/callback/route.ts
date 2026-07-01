import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSiteUrl } from "@/lib/auth/site-url";
import {
  COOKIE_CONSENT_NAME,
  COOKIE_CONSENT_VALUE,
  hasConsentCookieValue,
} from "@/lib/cookies/constants";
import { applyUxPreferenceCookiesOnResponse } from "@/lib/cookies/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { ThemePreference } from "@/lib/cookies/constants";

function resolveRedirectOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    return `https://${forwardedHost}`;
  }
  return getSiteUrl();
}

function authFailureRedirect(request: NextRequest): NextResponse {
  const url = new URL("/signin", resolveRedirectOrigin(request));
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

async function attachUxPreferencesToResponse(
  response: NextResponse,
  profileId: string,
  hasConsent: boolean
): Promise<void> {
  if (!hasConsent) return;

  const admin = await createAdminClient();
  const { data } = await admin
    .from("user_ux_preferences")
    .select("theme, sidebar_collapsed")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (!data) return;

  applyUxPreferenceCookiesOnResponse(
    response,
    {
      theme: data.theme as ThemePreference,
      sidebarCollapsed: data.sidebar_collapsed,
    },
    true
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = searchParams.get("next");

  if (!code) {
    return authFailureRedirect(request);
  }

  const origin = resolveRedirectOrigin(request);
  const isSignup = type === "signup" || next === "/signin";
  const isRecovery = type === "recovery" || next === "/update-password";

  const cookieStore = await cookies();
  const { supabase, attachRedirect } = createSupabaseWithResponse(cookieStore);

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return authFailureRedirect(request);
  }

  if (isSignup) {
    await supabase.auth.signOut();
    return attachRedirect(`${origin}/signin?confirmed=email`);
  }

  if (isRecovery) {
    return attachRedirect(`${origin}/update-password`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const hasConsent = hasConsentCookieValue(
    cookieStore.get(COOKIE_CONSENT_NAME)?.value
  );

  if (next?.startsWith("/")) {
    const redirect = attachRedirect(`${origin}${next}`);
    if (user) {
      await attachUxPreferencesToResponse(redirect, user.id, hasConsent);
    }
    return redirect;
  }

  await supabase.auth.signOut();
  return attachRedirect(`${origin}/signin`);
}
