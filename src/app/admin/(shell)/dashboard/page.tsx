import { createAdminClient } from "@/lib/supabase/server";
import { AdminPageShell } from "@/components/admin/layout";
import { ADMIN_SECTION_LABEL } from "@/lib/admin/ui-tokens";
import { StatCard } from "@/components/shared/StatCard";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { UrgentAlerts } from "@/components/admin/dashboard/UrgentAlerts";
import { RecentActions } from "@/components/admin/dashboard/RecentActions";
import { MetricsChart } from "@/components/admin/dashboard/MetricsChart";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Users,
  Briefcase,
  FileText,
  ShieldAlert,
  DollarSign,
  UserCheck,
  Handshake,
  LayoutDashboard,
} from "lucide-react";
import {
  EMPTY_PLATFORM_METRICS,
  platformMetricsSchema,
  type PlatformMetrics,
} from "@/types/admin.types";
import { requireAdminPageCapability } from "@/lib/server/auth/require-page-capability";
import { getCurrentAdminCapabilities } from "@/lib/server/auth/require-capability";
import {
  canShowDashboardWidget,
  filterAuditRowsByCapability,
  scopePlatformMetrics,
} from "@/lib/admin/capability-scopes";
import { hasCapability } from "@/lib/admin/capabilities";

export const metadata = {
  title: "Admin Dashboard | Replaceme",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdminPageCapability("dashboard");

  const { capabilities, isSuperAdmin } = await getCurrentAdminCapabilities();
  const admin = await createAdminClient();

  const [{ data: rawMetrics }, { data: auditLogs }] = await Promise.all([
    admin.rpc("get_platform_metrics"),
    admin
      .from("audit_logs")
      .select("id, action_type, target_type, target_id, created_at")
      .order("created_at", { ascending: false })
      .limit(40),
  ]);

  const parsed = platformMetricsSchema.safeParse(rawMetrics);
  const raw: PlatformMetrics = parsed.success
    ? parsed.data
    : EMPTY_PLATFORM_METRICS;

  const metrics = scopePlatformMetrics(raw, capabilities, isSuperAdmin);
  const scopedActions = filterAuditRowsByCapability(
    auditLogs ?? [],
    capabilities,
    isSuperAdmin
  ).slice(0, 8);

  const showUsers = canShowDashboardWidget("total_users", capabilities, isSuperAdmin);
  const showJobs = canShowDashboardWidget("active_jobs", capabilities, isSuperAdmin);
  const showIdentity = canShowDashboardWidget(
    "pending_verifications",
    capabilities,
    isSuperAdmin
  );
  const showBilling = canShowDashboardWidget(
    "active_subscriptions",
    capabilities,
    isSuperAdmin
  );
  const showApplications = canShowDashboardWidget(
    "total_applications",
    capabilities,
    isSuperAdmin
  );
  const showContracts = canShowDashboardWidget(
    "active_contracts",
    capabilities,
    isSuperAdmin
  );
  const showVerified = canShowDashboardWidget(
    "verified_workers",
    capabilities,
    isSuperAdmin
  );
  const showUserGrowth = canShowDashboardWidget(
    "user_growth_30d",
    capabilities,
    isSuperAdmin
  );
  const showJobActivity = canShowDashboardWidget(
    "job_activity_30d",
    capabilities,
    isSuperAdmin
  );
  const showAlerts =
    canShowDashboardWidget("urgent_alerts", capabilities, isSuperAdmin) ||
    metrics.urgent_alerts.length > 0;
  const canOpenAuditLog =
    isSuperAdmin || hasCapability(capabilities, "audit_log");
  const showRecentActions = true;

  const hasAnyMetric =
    showUsers ||
    showJobs ||
    showIdentity ||
    showBilling ||
    showApplications ||
    showContracts ||
    showVerified;

  const isEmpty =
    metrics.total_users === 0 &&
    metrics.active_jobs === 0 &&
    metrics.total_applications === 0 &&
    hasAnyMetric;

  const roleLabel = isSuperAdmin ? "Full platform access" : "Scoped to your modules";

  return (
    <AdminPageShell className="gap-8">
      <AdminPageHeader
        title="Platform Overview"
        description={`${roleLabel}. Live metrics for the queues and modules you can access.`}
      />

      {hasAnyMetric ? (
        <section className="space-y-4">
          <h2 className={ADMIN_SECTION_LABEL}>Key metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {showUsers ? (
              <StatCard
                variant="dashboard"
                title="Total Users"
                value={metrics.total_users}
                icon={<Users className="h-4 w-4" aria-hidden />}
                iconBgClass="bg-blue-50"
                iconColorClass="text-blue-600"
              />
            ) : null}
            {showJobs ? (
              <StatCard
                variant="dashboard"
                title="Active Jobs"
                value={metrics.active_jobs}
                icon={<Briefcase className="h-4 w-4" aria-hidden />}
                iconBgClass="bg-[#ebfdf2]"
                iconColorClass="text-[#006e2f]"
              />
            ) : null}
            {showIdentity ? (
              <StatCard
                variant="dashboard"
                title="Pending Verifications"
                value={metrics.pending_verifications}
                icon={<ShieldAlert className="h-4 w-4" aria-hidden />}
                iconBgClass="bg-amber-50"
                iconColorClass="text-amber-600"
              />
            ) : null}
            {showBilling ? (
              <StatCard
                variant="dashboard"
                title="Active Subscriptions"
                value={metrics.active_subscriptions}
                icon={<DollarSign className="h-4 w-4" aria-hidden />}
                iconBgClass="bg-violet-50"
                iconColorClass="text-violet-600"
              />
            ) : null}
          </div>
        </section>
      ) : null}

      {showApplications || showContracts || showVerified ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {showApplications ? (
            <StatCard
              variant="dashboard"
              title="Applications"
              value={metrics.total_applications}
              icon={<FileText className="h-4 w-4" aria-hidden />}
              iconBgClass="bg-violet-50"
              iconColorClass="text-violet-600"
            />
          ) : null}
          {showContracts ? (
            <StatCard
              variant="dashboard"
              title="Active Contracts"
              value={metrics.active_contracts}
              icon={<Handshake className="h-4 w-4" aria-hidden />}
              iconBgClass="bg-amber-50"
              iconColorClass="text-amber-600"
            />
          ) : null}
          {showVerified ? (
            <StatCard
              variant="dashboard"
              title="Verified Workers"
              value={metrics.verified_workers}
              icon={<UserCheck className="h-4 w-4" aria-hidden />}
              iconBgClass="bg-teal-50"
              iconColorClass="text-teal-600"
            />
          ) : null}
        </section>
      ) : null}

      {!hasAnyMetric ? (
        <EmptyState
          icon={<LayoutDashboard className="h-5 w-5" aria-hidden />}
          title="No module metrics yet"
          description="Your role does not include metric modules. Open a queue from the sidebar, or ask a super admin to grant Users, Jobs, Identity, or Billing."
        />
      ) : isEmpty ? (
        <EmptyState
          icon={<Users className="h-5 w-5" aria-hidden />}
          title="Marketplace is empty"
          description="Metrics will populate as workers and employers onboard."
        />
      ) : showUserGrowth ||
        showJobActivity ||
        showAlerts ||
        showRecentActions ? (
        <section className="space-y-4">
          <h2 className={ADMIN_SECTION_LABEL}>Analytics & activity</h2>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(280px,360px)] gap-6 items-start">
            {showUserGrowth || showJobActivity ? (
              <div className="space-y-6 min-w-0">
                {showUserGrowth ? (
                  <MetricsChart
                    title="User Growth"
                    data={metrics.user_growth_30d}
                  />
                ) : null}
                {showJobActivity ? (
                  <MetricsChart
                    title="Job Posting Activity"
                    data={metrics.job_activity_30d}
                    accentClass="from-emerald-400 to-teal-600"
                  />
                ) : null}
              </div>
            ) : (
              <div className="hidden lg:block" />
            )}
            <aside className="space-y-6 lg:sticky lg:top-24 w-full min-w-0">
              {showAlerts ? (
                <UrgentAlerts alerts={metrics.urgent_alerts} />
              ) : null}
              {showRecentActions ? (
                <RecentActions
                  actions={scopedActions}
                  showViewAll={canOpenAuditLog}
                />
              ) : null}
            </aside>
          </div>
        </section>
      ) : null}
    </AdminPageShell>
  );
}
