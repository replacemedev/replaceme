import { Shield, KeyRound, Smartphone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminPageShell } from "@/components/admin/layout";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminSectionLabel } from "@/components/admin/shared/AdminFilterPills";
import { StatCard } from "@/components/shared/StatCard";
import { SessionSecurityPanel } from "@/components/shared/security/SessionSecurityPanel";
import { AdminAccountSecurityCard } from "@/components/admin/settings/profile/AdminAccountSecurityCard";
import { AdminMfaManageCard } from "@/components/admin/security/AdminMfaManageCard";
import { AdminSecurityEventsCard } from "@/components/admin/security/AdminSecurityEventsCard";
import { AdminTeamMfaPostureCard } from "@/components/admin/security/AdminTeamMfaPostureCard";
import { requireAdminPageCapability } from "@/lib/server/auth/require-page-capability";
import { getCurrentAdminCapabilities } from "@/lib/server/auth/require-capability";
import {
  fetchAdminMfaPosture,
  fetchSecurityEvents,
} from "@/actions/admin/security";

export const metadata = {
  title: "Security | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminSecurityPage() {
  await requireAdminPageCapability("security");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: aal }, { data: factors }, { isSuperAdmin, capabilities }] =
    await Promise.all([
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      supabase.auth.mfa.listFactors(),
      getCurrentAdminCapabilities(),
    ]);

  const securityEventsPromise = fetchSecurityEvents(12);
  const posturePromise = isSuperAdmin
    ? fetchAdminMfaPosture()
    : Promise.resolve(null);

  const [securityEvents, postureResult] = await Promise.all([
    securityEventsPromise,
    posturePromise,
  ]);

  const totpFactors = factors?.totp ?? [];
  const mfaEnrolled = totpFactors.some((f) => f.status === "verified");
  const canViewFullAudit =
    isSuperAdmin || capabilities.includes("audit_log");

  return (
    <AdminPageShell className="space-y-8">
      <AdminPageHeader
        title="Security Center"
        description="Password, authenticator, sessions, and security-related audit events — aligned with staff MFA requirements."
      />

      <section className="space-y-4">
        <AdminSectionLabel>Session &amp; access</AdminSectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
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
        <p className="text-xs leading-relaxed text-slate-500">
          {aal?.currentLevel === "aal2"
            ? "Session meets admin assurance requirements (MFA verified)."
            : "Step-up MFA may be required for sensitive actions."}
          {mfaEnrolled
            ? ` · ${totpFactors.filter((f) => f.status === "verified").length} verified TOTP factor(s).`
            : " · Enroll TOTP to keep using the admin portal."}
        </p>
      </section>

      <section className="space-y-4">
        <AdminSectionLabel>Password &amp; authenticator</AdminSectionLabel>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <AdminAccountSecurityCard />
          <AdminMfaManageCard initiallyEnrolled={mfaEnrolled} />
        </div>
      </section>

      <section className="space-y-4">
        <AdminSectionLabel>Sign out devices</AdminSectionLabel>
        <SessionSecurityPanel variant="card" />
      </section>

      {isSuperAdmin && postureResult?.success ? (
        <section className="space-y-4">
          <AdminSectionLabel>Team posture</AdminSectionLabel>
          <AdminTeamMfaPostureCard rows={postureResult.rows} />
        </section>
      ) : null}

      <section className="space-y-4">
        <AdminSectionLabel>Activity</AdminSectionLabel>
        <AdminSecurityEventsCard
          events={securityEvents}
          canViewFullAudit={canViewFullAudit}
        />
      </section>
    </AdminPageShell>
  );
}
