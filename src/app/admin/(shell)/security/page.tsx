import Link from "next/link";
import { Shield, KeyRound, Smartphone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
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

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SecurityCard
          icon={KeyRound}
          title="Session AAL"
          value={
            aal?.currentLevel === "aal2"
              ? "AAL2 (MFA verified)"
              : "AAL1 (password only)"
          }
          detail={
            aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2"
              ? "Step-up required for sensitive actions"
              : "Session meets admin assurance requirements"
          }
        />
        <SecurityCard
          icon={Smartphone}
          title="TOTP MFA"
          value={mfaEnrolled ? "Enrolled" : "Not enrolled"}
          detail={
            mfaEnrolled
              ? `${totpFactors.filter((f) => f.status === "verified").length} verified factor(s)`
              : "Enroll TOTP for production admin accounts"
          }
        />
        <SecurityCard
          icon={Shield}
          title="Admin account"
          value={user?.email ?? "—"}
          detail="Role verified via JWT app_metadata"
        />
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

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <h2 className="text-sm font-bold text-slate-900 mb-4">
          Recent security actions
        </h2>
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
      </section>
    </div>
  );
}

function SecurityCard({
  icon: Icon,
  title,
  value,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-2 text-slate-500 mb-2">
        <Icon className="h-4 w-4" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wide">
          {title}
        </span>
      </div>
      <p className="text-lg font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}
