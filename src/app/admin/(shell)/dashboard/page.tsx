import { createAdminClient } from "@/lib/supabase/server";
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
} from "lucide-react";
import {
  EMPTY_PLATFORM_METRICS,
  platformMetricsSchema,
  type PlatformMetrics,
} from "@/types/admin.types";

export const metadata = {
  title: "Admin Dashboard | ReplaceMe",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const admin = await createAdminClient();

  const [{ data: rawMetrics }, { data: auditLogs }] = await Promise.all([
    admin.rpc("get_platform_metrics"),
    admin
      .from("audit_logs")
      .select("id, action_type, target_type, target_id, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const parsed = platformMetricsSchema.safeParse(rawMetrics);
  const metrics: PlatformMetrics = parsed.success
    ? parsed.data
    : EMPTY_PLATFORM_METRICS;

  const isEmpty =
    metrics.total_users === 0 &&
    metrics.active_jobs === 0 &&
    metrics.total_applications === 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Platform Overview"
        description="Live marketplace metrics from workers, employers, and jobs."
      />

      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Key metrics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          variant="dashboard"
          title="Total Users"
          value={metrics.total_users}
          icon={<Users className="h-4 w-4" aria-hidden />}
          iconBgClass="bg-blue-50"
          iconColorClass="text-blue-600"
        />
        <StatCard
          variant="dashboard"
          title="Active Jobs"
          value={metrics.active_jobs}
          icon={<Briefcase className="h-4 w-4" aria-hidden />}
          iconBgClass="bg-[#ebfdf2]"
          iconColorClass="text-[#006e2f]"
        />
        <StatCard
          variant="dashboard"
          title="Pending Verifications"
          value={metrics.pending_verifications}
          icon={<ShieldAlert className="h-4 w-4" aria-hidden />}
          iconBgClass="bg-amber-50"
          iconColorClass="text-amber-600"
        />
        <StatCard
          variant="dashboard"
          title="Active Subscriptions"
          value={metrics.active_subscriptions}
          icon={<DollarSign className="h-4 w-4" aria-hidden />}
          iconBgClass="bg-violet-50"
          iconColorClass="text-violet-600"
        />
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          variant="dashboard"
          title="Applications"
          value={metrics.total_applications}
          icon={<FileText className="h-4 w-4" aria-hidden />}
          iconBgClass="bg-violet-50"
          iconColorClass="text-violet-600"
        />
        <StatCard
          variant="dashboard"
          title="Active Contracts"
          value={metrics.active_contracts}
          icon={<Handshake className="h-4 w-4" aria-hidden />}
          iconBgClass="bg-amber-50"
          iconColorClass="text-amber-600"
        />
        <StatCard
          variant="dashboard"
          title="Verified Workers"
          value={metrics.verified_workers}
          icon={<UserCheck className="h-4 w-4" aria-hidden />}
          iconBgClass="bg-teal-50"
          iconColorClass="text-teal-600"
        />
      </section>

      {isEmpty ? (
        <EmptyState
          icon={<Users className="h-5 w-5" aria-hidden />}
          title="Marketplace is empty"
          description="Metrics will populate as workers and employers onboard."
        />
      ) : (
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Analytics & activity
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
            <div className="space-y-6">
              <MetricsChart
                title="User Growth"
                data={metrics.user_growth_30d}
              />
              <MetricsChart
                title="Job Posting Activity"
                data={metrics.job_activity_30d}
                accentClass="from-emerald-400 to-teal-600"
              />
            </div>
            <aside className="space-y-6 lg:sticky lg:top-24">
              <UrgentAlerts alerts={metrics.urgent_alerts} />
              <RecentActions actions={auditLogs ?? []} />
            </aside>
          </div>
        </section>
      )}
    </div>
  );
}
