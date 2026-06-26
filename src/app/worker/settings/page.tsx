import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkerSettingsClient } from "@/components/worker/settings/WorkerSettingsClient";

export const metadata = {
  title: "Account Settings | ReplaceMe",
};

export const dynamic = "force-dynamic";

export default async function WorkerSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("availability, hourly_rate, is_remote, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "worker") redirect("/login");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-2xl font-extrabold text-slate-900">Account Settings</h1>
      <p className="text-sm text-slate-500 mt-1 mb-8">
        Manage availability, hourly rate, and trust & safety reports.
      </p>
      <WorkerSettingsClient
        initial={{
          availability: profile.availability ?? "Full-time",
          hourlyRate: Number(profile.hourly_rate ?? 0),
          isRemote: Boolean(profile.is_remote),
        }}
      />
    </div>
  );
}
