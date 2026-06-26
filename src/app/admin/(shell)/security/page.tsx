import Link from "next/link";
import { Shield, KeyRound, Smartphone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminSectionLabel } from "@/components/admin/shared/AdminFilterPills";
import { StatCard } from "@/components/shared/StatCard";
import { fetchAuditLogs } from "@/actions/admin-actions";

export const metadata = {
  title: "Security | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminSecurityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: aal }, { data: factors }] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    supabase.auth.mfa.listFactors(),
  ]);

  const securityLogs = (await fetchAuditLogs(50)).filter((log) =>
    ["suspend_user", "unsuspend_user", "delete_job_post"].includes(
      log.action_type
    )
  );

  const totpFactors = factors?.totp ?? [];
  const mfaEnrolled = totpFactors.some((f) => f.status === "verified");

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Security Center"
        description="MFA status, session assurance, and security-related audit events."
      />

      <section className="space-y-4">
        <AdminSectionLabel>Session & access</AdminSectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            variant="dashboard"
            title="Session AAL"
            value={aal?.currentLevel === "aal2" ? "AAL2" : "AAL1"}
            icon={<KeyRound className="h-4 w-4" aria-hidden />}
            iconBgClass="bg-[#ebfdf2]"
            iconColorClass="text-[#006e2f]"
          />
          <StatCard
            variant="dashboard"
            title="TOTP MFA"
            value={mfaEnrolled ? "Enrolled" : "Not enrolled"}
            icon={<Smartphone className="h-4 w-4" aria-hidden />}
            iconBgClass={mfaEnrolled ? "bg-[#ebfdf2]" : "bg-amber-50"}
            iconColorClass={mfaEnrolled ? "text-[#006e2f]" : "text-amber-600"}
          />
          <StatCard
            variant="dashboard"
            title="Admin Account"
            value={user?.email?.split("@")[0] ?? "—"}
            icon={<Shield className="h-4 w-4" aria-hidden />}
            iconBgClass="bg-blue-50"
            iconColorClass="text-blue-600"
          />
        </div>
        <p className="text-xs text-slate-500">
          {aal?.currentLevel === "aal2"
            ? "Session meets admin assurance requirements (MFA verified)."
            : "Step-up MFA may be required for sensitive actions."}
          {mfaEnrolled
            ? ` · ${totpFactors.filter((f) => f.status === "verified").length} verified TOTP factor(s).`
            : " · Enroll TOTP for production admin accounts."}
        </p>
      </section>

      {!mfaEnrolled ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">MFA not enrolled</p>
          <p className="mt-1 text-amber-800">
            Enroll a TOTP authenticator in your Supabase account settings before
            production use.{" "}
            <Link
              href="/admin/mfa-challenge"
              className="font-semibold underline"
            >
              MFA challenge
            </Link>
          </p>
        </div>
      ) : null}

      <section className="space-y-4">
        <AdminSectionLabel>Recent security actions</AdminSectionLabel>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        {securityLogs.length === 0 ? (
          <p className="text-sm text-slate-400">No security events recorded.</p>
        ) : (
          <ul className="space-y-2">
            {securityLogs.slice(0, 10).map((log) => (
              <li
                key={log.id}
                className="flex justify-between gap-4 text-xs border-b border-slate-50 pb-2 last:border-0"
              >
                <span className="font-medium text-slate-700">
                  {log.action_type.replace(/_/g, " ")}
                </span>
                <time className="text-slate-400">
                  {new Date(log.created_at).toLocaleString()}
                </time>
              </li>
            ))}
          </ul>
        )}
        </div>
      </section>
    </div>
  );
}
