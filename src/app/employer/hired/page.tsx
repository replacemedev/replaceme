import React from "react";
import { getHiredData } from "@/actions/employer/hired";
import { getEmployerPlanUsage } from "@/actions/employer/billing";
import { StatsOverview } from "@/components/employer/hired/StatsOverview";
import { HiredWorkerList } from "@/components/employer/hired/HiredWorkerList";
import { UpsellFooter } from "@/components/employer/hired/UpsellFooter";
import { PostJobCTA } from "@/components/employer/jobs/PostJobCTA";
import { PlanUsageStrip } from "@/components/shared/entitlements/PlanUsageStrip";
import { ContextualUpgradeBanner } from "@/components/shared/entitlements/ContextualUpgradeBanner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Users } from "lucide-react";
import { normalizePlanSlug } from "@/lib/entitlements/ui-copy";

export const metadata = {
  title: "Hired Workers - Team Management | ReplaceMe",
  description:
    "Manage your active team members, view contract terms, and monitor monthly payroll statistics.",
};

export default async function HiredPage() {
  const [{ workers, stats }, planUsage] = await Promise.all([
    getHiredData(),
    getEmployerPlanUsage(),
  ]);

  const planSlug = normalizePlanSlug(planUsage?.planSlug ?? "discovery");
  const messagingEnabled = planUsage?.messagingEnabled ?? false;
  const isScale = planSlug === "scale";

  return (
    <div className="py-12 px-margin-desktop max-w-container-max mx-auto w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Hired Workers
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium max-w-2xl">
            {planSlug === "scale"
              ? "Scale plan — manage active contracts, messaging, and team payroll in one place."
              : planSlug === "discovery"
                ? "Discovery plan — review active hires. Upgrade for messaging and unlimited capacity."
                : `${planSlug.charAt(0).toUpperCase() + planSlug.slice(1)} plan — manage active team members and their contracts.`}
          </p>
        </div>
        <PostJobCTA planUsage={planUsage} />
      </div>

      {planUsage ? <PlanUsageStrip usage={planUsage} /> : null}

      {!isScale ? (
        <ContextualUpgradeBanner
          feature="priority_support"
          currentPlan={planSlug}
        />
      ) : null}

      {!messagingEnabled && workers.length > 0 ? (
        <ContextualUpgradeBanner feature="messaging" currentPlan={planSlug} />
      ) : null}

      <StatsOverview stats={stats} />

      {workers.length > 0 ? (
        <HiredWorkerList
          workers={workers}
          planSlug={planSlug}
          messagingEnabled={messagingEnabled}
        />
      ) : (
        <EmptyState
          icon={<Users size={22} />}
          title="No hired workers yet"
          description="When you hire a candidate from your applicant pipeline, their contract details will appear here."
          actionLabel="View job posts"
          actionHref="/employer/jobs"
        />
      )}

      <UpsellFooter />
    </div>
  );
}
