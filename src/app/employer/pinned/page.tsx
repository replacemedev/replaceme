import React from "react";
import { getPinnedWorkers } from "@/actions/employer/pinned";
import { getEmployerPlanUsage } from "@/actions/employer/billing";
import { PinnedWorkerGrid } from "@/components/employer/pinned/PinnedWorkerGrid";
import { PlanUsageStrip } from "@/components/shared/entitlements/PlanUsageStrip";
import { ContextualUpgradeBanner } from "@/components/shared/entitlements/ContextualUpgradeBanner";
import { pinnedPageSubhead, normalizePlanSlug } from "@/lib/entitlements/ui-copy";
import {
  EmployerPageHeader,
  EmployerPageShell,
} from "@/components/employer/layout";

export const metadata = {
  title: "Pinned Workers | Manage Bookmarked Talent | Replaceme",
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
    <EmployerPageShell>
      <EmployerPageHeader
        title="Pinned workers"
        badge={
          <span className="text-sm font-black bg-[#ebfdf2] text-[#006e2f] border border-[#006e2f]/15 py-1 px-3 rounded-full">
            {pinnedWorkers.length}
          </span>
        }
        subhead={pinnedPageSubhead(
          planSlug,
          pinnedWorkers.length,
          planUsage?.identityMode ?? "anonymous_preview"
        )}
      />

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
    </EmployerPageShell>
  );
}
