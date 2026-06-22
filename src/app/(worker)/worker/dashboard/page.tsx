import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function WorkerDashboard() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Fetch worker profile info
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("auth_user_id", user.id)
    .single();

  const firstName = profile?.first_name || user.user_metadata?.first_name || "Worker";

  return (
    <div className="max-w-container-max mx-auto px-margin-desktop py-12">
      <div className="flex flex-col justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display-md font-bold text-slate-900">
            Welcome back, {firstName}
          </h1>
          <p className="text-slate-500 font-body-base mt-1">
            Worker Dashboard Placeholder
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center">
        <p className="text-slate-600">The worker dashboard is currently under construction.</p>
      </div>
    </div>
  );
}

