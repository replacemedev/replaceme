import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROLE_HOME_PATH } from "@/config/navigation";

const MFA_CHALLENGE_PATH = "/admin/mfa-challenge";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isPasswordResetRoute =
    pathname === "/update-password" || pathname.startsWith("/auth/");
  const isAdminRoute = pathname.startsWith("/admin");
  const isMfaChallenge = pathname === MFA_CHALLENGE_PATH;
  const isWorkerRoute = pathname.startsWith("/worker");
  const isEmployerRoute = pathname.startsWith("/employer");
  const isProtectedRoute = isWorkerRoute || isEmployerRoute || isAdminRoute;

  if (isAdminRoute && !isMfaChallenge) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (user.app_metadata?.role !== "admin") {
      return NextResponse.redirect(new URL("/403", request.url));
    }
  }

  if (isMfaChallenge) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (user.app_metadata?.role !== "admin") {
      return NextResponse.redirect(new URL("/403", request.url));
    }
  }

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user) {
    if (isPasswordResetRoute) {
      return supabaseResponse;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, professional_title, location, skills")
      .eq("id", user.id)
      .maybeSingle();

    const role =
      (user.app_metadata?.role as string | undefined) ??
      profile?.role ??
      "worker";

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
        .select("company_name, industry")
        .eq("employer_id", user.id)
        .maybeSingle();

      const onboardingComplete = Boolean(
        company?.company_name?.trim() && company?.industry?.trim()
      );
      if (!onboardingComplete) {
        return NextResponse.redirect(
          new URL("/employer/onboarding", request.url)
        );
      }
    }
  }

  return supabaseResponse;
}
