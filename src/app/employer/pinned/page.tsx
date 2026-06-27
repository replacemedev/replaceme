import React from "react";
import { getPinnedWorkers } from "@/actions/employer/pinned";
import { getEmployerPlanUsage } from "@/actions/employer/billing";
import { PinnedWorkerGrid } from "@/components/employer/pinned/PinnedWorkerGrid";
import { PlanUsageStrip } from "@/components/shared/entitlements/PlanUsageStrip";
import { ContextualUpgradeBanner } from "@/components/shared/entitlements/ContextualUpgradeBanner";
import { pinnedPageSubhead, normalizePlanSlug } from "@/lib/entitlements/ui-copy";

export const metadata = {
  title: "Pinned Workers - Manage Bookmarked Talent | ReplaceMe",
  description:
    "Review, compare, and manage candidate profiles pinned during your remote talent search.",
};

export default async function PinnedPage() {
  const [pinnedWorkers, planUsage] = await Promise.all([
    getPinnedWorkers(),
    getEmployerPlanUsage(),
  ]);

  const planSlug = normalizePlanSlug(planUsage?.planSlug ?? "discovery");
  const messagingEnabled = planUsage?.messagingEnabled ?? false;
  const isPreview = planUsage?.identityMode === "anonymous_preview";
  const showIdentityBanner = isPreview;
  const showPriorityBanner =
    !showIdentityBanner &&
    planSlug !== "growth" &&
    planSlug !== "scale" &&
    pinnedWorkers.length > 0;

  return (
    <div className="py-12 px-margin-desktop max-w-container-max mx-auto w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            Pinned Workers
            <span className="text-sm font-black bg-emerald-100 text-emerald-800 py-1 px-3 rounded-full">
              {pinnedWorkers.length}
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium max-w-2xl">
            {pinnedPageSubhead(
              planSlug,
              pinnedWorkers.length,
              planUsage?.identityMode ?? "anonymous_preview"
            )}
          </p>
        </div>
      </div>

      {planUsage ? <PlanUsageStrip usage={planUsage} /> : null}

      {showIdentityBanner ? (
        <ContextualUpgradeBanner feature="identity" currentPlan={planSlug} />
      ) : null}

      {showPriorityBanner ? (
        <ContextualUpgradeBanner
          feature="priority_listing"
          currentPlan={planSlug}
        />
      ) : null}

      <PinnedWorkerGrid
        initialPinnedWorkers={pinnedWorkers}
        planSlug={planSlug}
        messagingEnabled={messagingEnabled}
      />
    </div>
  );
}
