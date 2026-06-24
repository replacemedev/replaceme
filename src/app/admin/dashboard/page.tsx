import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/admin/dashboard/StatCard";
import { UrgentAlerts } from "@/components/admin/dashboard/UrgentAlerts";
import { RecentActions } from "@/components/admin/dashboard/RecentActions";
import {
  Users,
  Briefcase,
  FileText,
  Handshake,
  Building2,
  UserCheck,
} from "lucide-react";

export const metadata = {
  title: "Admin Dashboard | ReplaceMe",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalWorkers },
    { count: totalEmployers },
    { count: activeJobs },
    { count: totalApplications },
    { count: activeContracts },
    { count: verifiedWorkers },
    { data: recentAuditLogs },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "worker"),
    supabase
      .from("company_profiles")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "Active"),
    supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase
      .from("contracts")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "worker")
      .eq("is_verified", true),
    supabase
      .from("audit_logs")
      .select("id, action_type, target_type, target_id, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const totalUsers = (totalWorkers ?? 0) + (totalEmployers ?? 0);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Platform Overview
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Real-time marketplace metrics aggregated from live data.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          label="Total Users"
          value={totalUsers}
          icon={Users}
          accentColor="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Active Jobs"
          value={activeJobs ?? 0}
          icon={Briefcase}
          accentColor="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Applications"
          value={totalApplications ?? 0}
          icon={FileText}
          accentColor="bg-violet-50 text-violet-600"
        />
        <StatCard
          label="Active Contracts"
          value={activeContracts ?? 0}
          icon={Handshake}
          accentColor="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Employers"
          value={totalEmployers ?? 0}
          icon={Building2}
          accentColor="bg-rose-50 text-rose-600"
        />
        <StatCard
          label="Verified Workers"
          value={verifiedWorkers ?? 0}
          icon={UserCheck}
          accentColor="bg-teal-50 text-teal-600"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <h2 className="text-sm font-bold text-slate-900 mb-3">
              User Growth Trend
            </h2>
            <div className="h-48 flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <p className="text-xs text-slate-400">
                Chart placeholder — integrate when analytics data available
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <h2 className="text-sm font-bold text-slate-900 mb-3">
              Job Posting Activity
            </h2>
            <div className="h-48 flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <p className="text-xs text-slate-400">
                Chart placeholder — integrate when time-series data available
              </p>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <UrgentAlerts alerts={[]} />
          <RecentActions actions={recentAuditLogs ?? []} />
        </aside>
      </section>
    </div>
  );
}
