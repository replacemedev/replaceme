import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { assertEmployerResumeDownload } from "@/lib/server/entitlements";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const workerId = searchParams.get("workerId");

  if (!workerId) {
    return new NextResponse("workerId parameter is required", { status: 400 });
  }

  // 1. Authenticate user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Verify the requesting user is an employer
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "employer") {
    return new NextResponse("Forbidden: Access restricted to employers", { status: 403 });
  }

  // 2. Verify subscription tier entitlement
  const check = await assertEmployerResumeDownload(user.id);
  if (!check.allowed) {
    return new NextResponse(
      JSON.stringify({
        error: check.error ?? "Upgrade required to download resumes.",
        suggestedPlan: check.suggestedPlan,
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // 3. Fetch worker resume path
  const { data: worker } = await supabase
    .from("profiles")
    .select("first_name, last_name, resume_url")
    .eq("id", workerId)
    .eq("role", "worker")
    .single();

  if (!worker || !worker.resume_url) {
    return new NextResponse("Resume not found", { status: 404 });
  }

  // 4. Download file from private resumes storage bucket using the admin client
  const adminSupabase = await createAdminClient();
  const { data, error } = await adminSupabase.storage
    .from("resumes")
    .download(worker.resume_url);

  if (error || !data) {
    return new NextResponse("Resume file not found in storage", { status: 404 });
  }

  const filename = [
    worker.first_name || "worker",
    worker.last_name || "resume",
    "resume",
  ]
    .join("_")
    .replace(/[^\w.-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 120);

  return new NextResponse(data, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}.pdf"`,
    },
  });
}
