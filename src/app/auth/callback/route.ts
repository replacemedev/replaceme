import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/auth/site-url";

function buildRedirect(path: string, request: Request): string {
  const origin = getSiteUrl();
  const forwardedHost = request.headers.get("x-forwarded-host");

  if (forwardedHost) {
    return `https://${forwardedHost}${path}`;
  }

  return `${origin}${path}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(
      buildRedirect("/login?error=auth_callback_failed", request)
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      buildRedirect("/login?error=auth_callback_failed", request)
    );
  }

  if (type === "signup" || next === "/login") {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      buildRedirect("/login?confirmed=email", request)
    );
  }

  if (type === "recovery" || next === "/update-password") {
    return NextResponse.redirect(buildRedirect("/update-password", request));
  }

  await supabase.auth.signOut();
  return NextResponse.redirect(buildRedirect("/login", request));
}
