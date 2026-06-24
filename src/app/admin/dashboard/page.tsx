import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/shared/EmptyState";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Admin Dashboard | ReplaceMe",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, first_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/login");
  }

  const [{ count: workerCount }, { count: jobCount }, { count: applicationCount }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "worker"),
      supabase
        .from("job_posts")
        .select("*", { count: "exact", head: true })
        .eq("status", "Active"),
      supabase.from("applications").select("*", { count: "exact", head: true }),
    ]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
        Admin Control Panel
      </h1>
      <p className="text-sm text-slate-500 mb-8">
        Welcome, {profile.first_name ?? "Admin"}. Marketplace overview from live Supabase data.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">Workers</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{workerCount ?? 0}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">Active Jobs</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{jobCount ?? 0}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase text-slate-400">Applications</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">
            {applicationCount ?? 0}
          </p>
        </article>
      </div>

      {(workerCount ?? 0) === 0 && (jobCount ?? 0) === 0 && (
        <EmptyState
          icon={<Shield className="h-5 w-5" aria-hidden />}
          title="Marketplace is empty"
          description="No workers, jobs, or applications yet. Data will appear here as users onboard."
        />
      )}
    </div>
  );
}
