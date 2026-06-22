import React from "react";
import { redirect } from "next/navigation";
import { Briefcase, Users, UserCheck, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

// Server Actions
import {
  getDashboardStats,
  getRecentJobs,
  getRecentMessages,
  getPinnedTalent,
  getYourWorkers,
  getBillingPlan,
} from "@/actions/employer/dashboard";

// Modular Presentation Components
import { StatCard } from "@/components/employer/dashboard/StatCard";
import { QuickAccess } from "@/components/employer/dashboard/QuickAccess";
import { ActiveJobs } from "@/components/employer/dashboard/ActiveJobs";
import { RecentMessages } from "@/components/employer/dashboard/RecentMessages";
import { PinnedTalent } from "@/components/employer/dashboard/PinnedTalent";
import { HiringKit } from "@/components/employer/dashboard/HiringKit";
import { YourWorkers } from "@/components/employer/dashboard/YourWorkers";
import { BillingPlan } from "@/components/employer/dashboard/BillingPlan";
import { PremiumUpsell } from "@/components/employer/dashboard/PremiumUpsell";

export default async function EmployerDashboard() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch employer profile info
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, first_name")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const employerId = profile.id;
  const firstName = profile.first_name || user.user_metadata?.first_name || "Employer";

  // Fetch all dashboard data using Zero-Trust Server Actions
  const stats = await getDashboardStats(employerId);
  const jobs = await getRecentJobs(employerId);
  const messages = await getRecentMessages(employerId);
  const pinnedTalent = await getPinnedTalent(employerId);
  const workers = await getYourWorkers(employerId);
  const billing = await getBillingPlan(employerId);

  return (
    <div className="max-w-container-max mx-auto px-margin-desktop py-12">
      {/* Title & Subtitle Area */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">Dashboard Overview</h1>
        <p className="text-slate-500 font-medium text-sm mt-1.5 leading-relaxed">
          Welcome back, {firstName}. Manage your specialized remote teams across Content, Design, and Admin support.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column - Main Content Area */}
        <div className="lg:col-span-2 space-y-10">
          {/* Top Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Active Job Posts"
              value={stats.activeJobPosts}
              icon={<Briefcase size={20} className="text-blue-500" />}
            />
            <StatCard
              title="Total Applicants"
              value={stats.totalApplicants}
              icon={<Users size={20} className="text-purple-500" />}
            />
            <StatCard
              title="Hired Workers"
              value={stats.hiredWorkers}
              icon={<UserCheck size={20} className="text-emerald-500" />}
            />
            <StatCard
              title="Unread Messages"
              value={stats.unreadMessages}
              icon={<MessageSquare size={20} className="text-orange-500" />}
              highlight
            />
          </div>

          {/* Quick Access Row */}
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-4">Quick Access to Core Workflows</h2>
            <QuickAccess />
          </div>

          {/* Active Job Posts */}
          <ActiveJobs jobs={jobs} />

          {/* Recent Messages */}
          <RecentMessages messages={messages} />

          {/* Pinned Talent */}
          <PinnedTalent pinnedTalent={pinnedTalent} />

          {/* Exclusive Hiring Kit */}
          <HiringKit />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-8">
          {/* Your Workers */}
          <YourWorkers workers={workers} />

          {/* Plan & Billing */}
          <BillingPlan billing={billing} />

          {/* Scale with Premium Upsell */}
          <PremiumUpsell />
        </div>
      </div>
    </div>
  );
}
