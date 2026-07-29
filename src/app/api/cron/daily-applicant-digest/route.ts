import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";
import { sendTransactionalEmail } from "@/lib/server/email/mailer";
import { renderEmailLayout } from "@/lib/server/email/email-templates";
import { normalizeEmailTierSlug } from "@/lib/server/email/paid-tier";
import { fetchEmployerEntitlements } from "@/lib/server/entitlements";

export const runtime = "nodejs";

function assertCronAuth(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!assertCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = await createAdminClient();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const { data: companies, error } = await admin
      .from("company_profiles")
      .select(
        `
        employer_id,
        application_notification_pref,
        profiles:profiles!company_profiles_employer_id_fkey ( email, role )
      `
      )
      .eq("application_notification_pref", "email_daily_summary");

    if (error) throw new Error(error.message);

    let sent = 0;

    for (const row of companies ?? []) {
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      const employerId = row.employer_id as string;
      const email = profile?.email as string | undefined;
      if (!email) continue;

      const entitlements = await fetchEmployerEntitlements(employerId, admin);
      const tierSlug = normalizeEmailTierSlug(entitlements?.planSlug);

      const { data: jobRows } = await admin
        .from("job_posts")
        .select("id")
        .eq("employer_id", employerId)
        .eq("status", "Active");

      const jobIds = (jobRows ?? [])
        .map((j) => j.id)
        .filter((id): id is string => typeof id === "string" && id.length > 0);
      if (jobIds.length === 0) continue;

      const { count: newApps } = await admin
        .from("applications")
        .select("id", { count: "exact", head: true })
        .in("job_id", jobIds)
        .gte("created_at", since);

      if (!newApps || newApps <= 0) continue;

      const ctaUrl = `${siteUrl}/employer/dashboard`;
      const body = renderEmailLayout({
        title: "Your daily applicant summary",
        preheader: `${newApps} new applicant${newApps === 1 ? "" : "s"} in the last 24 hours`,
        bodyHtml: `
          <p style="margin:0 0 14px 0;">Here's your daily summary:</p>
          <p style="margin:0 0 18px 0;"><strong>${newApps}</strong> new applicant${newApps === 1 ? "" : "s"} in the last 24 hours.</p>
          <p style="margin:0 0 18px 0;">
            <a href="${ctaUrl}" style="display:inline-block;background:#006e2f;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:12px;font-weight:700;font-size:14px;">
              Review your dashboard
            </a>
          </p>
        `,
        siteUrl,
      });

      const result = await sendTransactionalEmail({
        templateKey: "employer.daily_applicant_digest",
        to: email,
        subject: `Daily summary: ${newApps} new applicant${newApps === 1 ? "" : "s"}`,
        html: body.html,
        text: body.text,
        userId: employerId,
        role: "employer",
        tierSlug,
        tags: { category: "digest", plan: tierSlug },
        idempotencyKey: `daily-digest/${employerId}/${new Date().toISOString().slice(0, 10)}`,
      });

      if (result.success) sent += 1;
    }

    return NextResponse.json({ ok: true, sent });
  } catch (err) {
    safeError("daily-applicant-digest cron:", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
