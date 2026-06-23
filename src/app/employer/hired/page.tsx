import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getHiredData } from "@/actions/employer/hired";
import { getCurrentEmployerSubscription } from "@/actions/employer/billing";
import { StatsOverview } from "@/components/employer/hired/StatsOverview";
import { UpgradeBanner } from "@/components/employer/hired/UpgradeBanner";
import { HiredWorkerList } from "@/components/employer/hired/HiredWorkerList";
import { UpsellFooter } from "@/components/employer/hired/UpsellFooter";

export const metadata = {
  title: "Hired Workers - Team Management | ReplaceMe",
  description: "Manage your active team members, view contract terms, and monitor monthly payroll statistics.",
};

export default async function HiredPage() {
  // Fetch dynamic contracts and aggregated statistics from database securely on the server
  const { workers, stats } = await getHiredData();

  // Fetch the employer's current active subscription state
  const subscription = await getCurrentEmployerSubscription();

  // Check if they need to be shown the upgrade professional banner
  const isProfessional = 
    subscription?.active && 
    subscription.planName.toLowerCase() === "professional";

  return (
    <div className="py-12 px-margin-desktop max-w-container-max mx-auto w-full space-y-8">
      {/* Top Header Area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Hired Workers
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Manage your active team members and their contracts.
          </p>
        </div>
        <Link
          href="/jobs/create"
          className="h-11 px-5 bg-[#006e2f] hover:bg-[#005c26] text-white font-bold text-xs rounded-2xl transition-colors flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
        >
          <Plus size={16} />
          Post New Role
        </Link>
      </div>

      {/* Conditionally display the upgrade banner if not on the Professional tier */}
      {!isProfessional && <UpgradeBanner />}

      {/* Stats Overview Cards */}
      <StatsOverview stats={stats} />

      {/* Hired Workers List */}
      {workers.length > 0 ? (
        <HiredWorkerList workers={workers} />
      ) : (
        /* Empty State */
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm max-w-lg mx-auto">
          <h3 className="text-sm font-extrabold text-slate-800 mb-2">
            No hired workers yet
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-6 font-medium">
            You don't have any active contracts. Once you hire a candidate from your applicant pipeline, their contract details will appear here.
          </p>
        </div>
      )}

      {/* Upsell Footer (Need more talent?) */}
      <UpsellFooter />
    </div>
  );
}
