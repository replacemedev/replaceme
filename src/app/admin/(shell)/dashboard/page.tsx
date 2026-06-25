import { createAdminClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/shared/StatCard";
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
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Platform Overview
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Live marketplace metrics from Workers, Employers, and Jobs.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={metrics.total_users}
          icon={Users}
          accentColor="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Active Jobs"
          value={metrics.active_jobs}
          icon={Briefcase}
          accentColor="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Pending Verifications"
          value={metrics.pending_verifications}
          icon={ShieldAlert}
          accentColor="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Active Subscriptions"
          value={metrics.active_subscriptions}
          icon={DollarSign}
          accentColor="bg-violet-50 text-violet-600"
        />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          label="Applications"
          value={metrics.total_applications}
          icon={FileText}
          accentColor="bg-violet-50 text-violet-600"
        />
        <StatCard
          label="Active Contracts"
          value={metrics.active_contracts}
          icon={Handshake}
          accentColor="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Verified Workers"
          value={metrics.verified_workers}
          icon={UserCheck}
          accentColor="bg-teal-50 text-teal-600"
        />
      </section>

      {isEmpty ? (
        <EmptyState
          icon={<Users className="h-5 w-5" aria-hidden />}
          title="Marketplace is empty"
          description="Metrics will populate as workers and employers onboard."
        />
      ) : (
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-6">
            <MetricsChart
              title="User Growth (30d)"
              data={metrics.user_growth_30d}
            />
            <MetricsChart
              title="Job Posting Activity (30d)"
              data={metrics.job_activity_30d}
            />
          </div>
          <aside className="space-y-6">
            <UrgentAlerts alerts={metrics.urgent_alerts} />
            <RecentActions actions={auditLogs ?? []} />
          </aside>
        </section>
      )}
    </div>
  );
}
