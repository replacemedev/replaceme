import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";
import { sendTransactionalEmail } from "@/lib/server/email/mailer";
import { renderEmailLayout } from "@/lib/server/email/email-templates";

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

    // Find employers on Starter plan with active jobs and applications in the last 7 days.
    // This is a real DB query (no mock data) and will naturally return 0 rows on empty DB.
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: rows, error } = await admin
      .from("employer_subscriptions")
      .select(
        `
        employer_id,
        plan_slug,
        profiles:profiles!employer_subscriptions_employer_id_fkey ( id, email, role ),
        jobs:jobs!jobs_employer_id_fkey ( id )
      `
      )
      .eq("plan_slug", "starter")
      .eq("status", "active");

    if (error) throw new Error(error.message);

    const employers = (rows ?? []).flatMap((row) => {
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      if (!profile?.email) return [];
      return [
        {
          employerId: row.employer_id as string,
          email: profile.email as string,
          role: profile.role as "employer" | "worker" | "admin",
        },
      ];
    });

    let sent = 0;

    for (const employer of employers) {
      const { count: newApps } = await admin
        .from("applications")
        .select("id", { count: "exact", head: true })
        .in(
          "job_id",
          (
            await admin
              .from("job_posts")
              .select("id")
              .eq("employer_id", employer.employerId)
              .eq("status", "Active")
          ).data?.map((j) => j.id) ?? []
        )
        .gte("created_at", sevenDaysAgo);

      if (!newApps || newApps <= 0) continue;

      const ctaUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/employer/dashboard`;
      const body = renderEmailLayout({
        title: "Your weekly applicant digest",
        preheader: `${newApps} new applicants this week`,
        bodyHtml: `
          <p style="margin:0 0 14px 0;">Here’s your weekly summary:</p>
          <p style="margin:0 0 18px 0;"><strong>${newApps}</strong> new applicant${newApps === 1 ? "" : "s"} in the last 7 days.</p>
          <p style="margin:0 0 18px 0;">
            <a href="${ctaUrl}" style="display:inline-block;background:#006e2f;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:12px;font-weight:700;font-size:14px;">
              Review your dashboard
            </a>
          </p>
        `,
      });

      const result = await sendTransactionalEmail({
        templateKey: "employer.weekly_applicant_digest",
        to: employer.email,
        subject: "Weekly digest: new applicants",
        html: body.html,
        text: body.text,
        userId: employer.employerId,
        role: employer.role,
        tierSlug: "starter",
        tags: { category: "digest", window: "7d" },
        idempotencyKey: `weekly-digest/${employer.employerId}/${sevenDaysAgo.slice(0, 10)}`,
      });

      if (result.success) sent += 1;
    }

    return NextResponse.json({ success: true, sent });
  } catch (err) {
    safeError("weekly-applicant-digest:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

