import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ROLE_HOME_PATH } from '@/config/navigation'

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

  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup")
  const isWorkerRoute = pathname.startsWith("/worker")
  const isEmployerRoute = pathname.startsWith("/employer")
  const isAdminRoute = pathname.startsWith("/admin")
  const isProtectedRoute = isWorkerRoute || isEmployerRoute || isAdminRoute

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    const role =
      (user.app_metadata?.role as string | undefined) ??
      profile?.role ??
      "worker";
    const homePath =
      role === "admin"
        ? ROLE_HOME_PATH.admin
        : role === "employer"
          ? ROLE_HOME_PATH.employer
          : ROLE_HOME_PATH.worker

    if (isAuthRoute) {
      return NextResponse.redirect(new URL(homePath, request.url))
    }

    if (role === "admin" && (isWorkerRoute || isEmployerRoute)) {
      return NextResponse.redirect(new URL(ROLE_HOME_PATH.admin, request.url))
    }

    if (role === "worker" && (isEmployerRoute || isAdminRoute)) {
      return NextResponse.redirect(new URL(ROLE_HOME_PATH.worker, request.url))
    }

    if (role === "employer" && (isWorkerRoute || isAdminRoute)) {
      return NextResponse.redirect(new URL(ROLE_HOME_PATH.employer, request.url))
    }
  }

  return supabaseResponse
}
