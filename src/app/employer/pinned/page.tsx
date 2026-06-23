import React from "react";
import { getPinnedWorkers } from "@/actions/employer/pinned";
import { getCurrentEmployerSubscription } from "@/actions/employer/billing";
import { PinnedWorkerGrid } from "@/components/employer/pinned/PinnedWorkerGrid";
import { UpgradeBanner } from "@/components/employer/pinned/UpgradeBanner";

export const metadata = {
  title: "Pinned Workers - Manage Bookmarked Talent | ReplaceMe",
  description: "Review, compare, and manage candidate profiles pinned during your remote talent search.",
};

export default async function PinnedPage() {
  // Fetch bookmarked workers for the currently authenticated employer
  const pinnedWorkers = await getPinnedWorkers();

  // Fetch the employer's current active subscription state
  const subscription = await getCurrentEmployerSubscription();

  // Check if they need to be shown the upgrade professional banner
  const isProfessional = 
    subscription?.active && 
    subscription.planName.toLowerCase() === "professional";

  return (
    <div className="py-12 px-margin-desktop max-w-container-max mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            Pinned Workers
            <span className="text-sm font-black bg-emerald-100 text-emerald-800 py-1 px-3 rounded-full">
              {pinnedWorkers.length}
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Review and organize top candidates bookmarked during your talent search.
          </p>
        </div>
      </div>

      {/* Conditionally display the upgrade banner if not on the Professional tier */}
      {!isProfessional && <UpgradeBanner />}

      {/* Interactive Grid List with client side optimistic filtering */}
      <PinnedWorkerGrid initialPinnedWorkers={pinnedWorkers} />
    </div>
  );
}
