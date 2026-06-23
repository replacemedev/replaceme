import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/signup");
  const isWorkerRoute = request.nextUrl.pathname.startsWith("/worker");
  const isEmployerRoute = request.nextUrl.pathname.startsWith("/employer");
  const isProtectedRoute = isWorkerRoute || isEmployerRoute;

  // If user is not logged in and tries to access a protected route, redirect to login
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based routing
  if (user) {
    // Determine user role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("auth_user_id", user.id)
      .single();

    const role = profile?.role || "worker";

    // If user is logged in and tries to access login/signup, redirect to their dashboard
    if (isAuthRoute) {
      if (role === "employer") {
        return NextResponse.redirect(new URL("/employer/dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/worker/dashboard", request.url));
      }
    }

    // If worker tries to access employer pages
    if (role === "worker" && isEmployerRoute) {
      return NextResponse.redirect(new URL("/worker/dashboard", request.url));
    }

    // If employer tries to access worker pages
    if (role === "employer" && isWorkerRoute) {
      return NextResponse.redirect(new URL("/employer/dashboard", request.url));
    }
  }

  return supabaseResponse
}
