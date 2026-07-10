import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROLE_HOME_PATH } from "@/config/navigation";
import { profileIdFilter, resolveRoleFromUser } from "@/lib/auth/role";
import {
  IDLE_COOKIE,
  isSessionIdle,
} from "@/lib/security/session-idle";

const MFA_CHALLENGE_PATH = "/admin/mfa-challenge";

const IDLE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  // Survives setAll recreating the response
  let idleStamp: string | null = null;

  const applyIdleCookie = (response: NextResponse) => {
    if (!idleStamp) return;
    response.cookies.set(IDLE_COOKIE, idleStamp, IDLE_COOKIE_OPTIONS);
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          applyIdleCookie(supabaseResponse);
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const isAdmin = user.app_metadata?.role === "admin";
    const lastRaw = request.cookies.get(IDLE_COOKIE)?.value;
    const lastActive = lastRaw ? Number(lastRaw) : null;

    if (isSessionIdle(lastActive, isAdmin)) {
      await supabase.auth.signOut();
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("reason", "session_expired");
      const redirect = NextResponse.redirect(signInUrl);
      redirect.cookies.delete(IDLE_COOKIE);
      return redirect;
    }

    idleStamp = String(Date.now());
    applyIdleCookie(supabaseResponse);
  }

  const pathname = request.nextUrl.pathname;
  const isAuthRoute =
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup");
  const isPasswordResetRoute =
    pathname === "/update-password" || pathname.startsWith("/auth/");
  const isAdminRoute = pathname.startsWith("/admin");
  const isMfaChallenge = pathname === MFA_CHALLENGE_PATH;
  const isWorkerRoute = pathname.startsWith("/worker");
  const isEmployerRoute = pathname.startsWith("/employer");
  const isProtectedRoute = isWorkerRoute || isEmployerRoute || isAdminRoute;

  const isGuestBlockedWorkerIdentityRoute =
    pathname.startsWith("/workers/") ||
    /^\/profile\/[^/]+$/.test(pathname) ||
    pathname === "/candidates" ||
    pathname.startsWith("/candidates/");

  if (!user && isGuestBlockedWorkerIdentityRoute) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isAdminRoute && !isMfaChallenge) {
    if (!user) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
    if (user.app_metadata?.role !== "admin") {
      return NextResponse.redirect(new URL("/403", request.url));
    }
  }

  if (isMfaChallenge) {
    if (!user) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
    if (user.app_metadata?.role !== "admin") {
      return NextResponse.redirect(new URL("/403", request.url));
    }
  }

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (user) {
    if (isPasswordResetRoute) {
      return supabaseResponse;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, professional_title, location, skills")
      .or(profileIdFilter(user.id))
      .maybeSingle();

    const role = resolveRoleFromUser(user, profile?.role);
    const profileId = profile?.id ?? user.id;

    const homePath =
      role === "admin"
        ? ROLE_HOME_PATH.admin
        : role === "employer"
          ? ROLE_HOME_PATH.employer
          : ROLE_HOME_PATH.worker;

    if (isAuthRoute) {
      return NextResponse.redirect(new URL(homePath, request.url));
    }

    if (role === "admin" && (isWorkerRoute || isEmployerRoute)) {
      return NextResponse.redirect(new URL(ROLE_HOME_PATH.admin, request.url));
    }

    if (role === "worker" && (isEmployerRoute || isAdminRoute)) {
      return NextResponse.redirect(new URL(ROLE_HOME_PATH.worker, request.url));
    }

    if (role === "employer" && (isWorkerRoute || isAdminRoute)) {
      return NextResponse.redirect(new URL(ROLE_HOME_PATH.employer, request.url));
    }

    if (
      role === "worker" &&
      isWorkerRoute &&
      !pathname.startsWith("/worker/onboarding")
    ) {
      const onboardingComplete = Boolean(
        profile?.professional_title?.trim() &&
          profile?.location?.trim() &&
          profile.skills &&
          profile.skills.length > 0
      );
      if (!onboardingComplete) {
        return NextResponse.redirect(
          new URL("/worker/onboarding", request.url)
        );
      }
    }

    if (
      role === "employer" &&
      isEmployerRoute &&
      !pathname.startsWith("/employer/onboarding")
    ) {
      const { data: company } = await supabase
        .from("company_profiles")
        .select("company_name, industry, company_size")
        .eq("employer_id", profileId)
        .maybeSingle();

      const onboardingComplete = Boolean(
        company?.company_name?.trim() &&
          company?.industry?.trim() &&
          company?.company_size?.trim() &&
          profile?.skills &&
          profile.skills.length > 0
      );
      if (!onboardingComplete) {
        return NextResponse.redirect(
          new URL("/employer/onboarding", request.url)
        );
      }
    }
  }

  applyIdleCookie(supabaseResponse);
  return supabaseResponse;
}
