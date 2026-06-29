import React from "react";
import Link from "next/link";
import { getHiredData } from "@/actions/employer/hired";
import { getEmployerPlanUsage } from "@/actions/employer/billing";
import { HiredStatsStrip } from "@/components/employer/hired/HiredStatsStrip";
import { HiredWorkerList } from "@/components/employer/hired/HiredWorkerList";
import { PostJobCTA } from "@/components/employer/jobs/PostJobCTA";
import { PlanUsageStrip } from "@/components/shared/entitlements/PlanUsageStrip";
import { ContextualUpgradeBanner } from "@/components/shared/entitlements/ContextualUpgradeBanner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Users } from "lucide-react";
import { normalizePlanSlug } from "@/lib/entitlements/ui-copy";
import {
  EmployerPageHeader,
  EmployerPageShell,
  EmployerSectionCard,
} from "@/components/employer/layout";

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

  const subhead =
    planSlug === "scale"
      ? "Scale plan — manage active contracts, messaging, and team payroll in one place."
      : planSlug === "discovery"
        ? "Discovery plan — review active hires. Upgrade for messaging and unlimited capacity."
        : `${planSlug.charAt(0).toUpperCase() + planSlug.slice(1)} plan — manage active team members and their contracts.`;

  return (
    <EmployerPageShell className="gap-8">
      <EmployerPageHeader
        title="Hired workers"
        subhead={subhead}
        actions={<PostJobCTA planUsage={planUsage} />}
      />

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

      <HiredStatsStrip stats={stats} />

      {workers.length > 0 ? (
        <HiredWorkerList
          workers={workers}
          planSlug={planSlug}
          messagingEnabled={messagingEnabled}
        />
      ) : (
        <div className="space-y-4">
          <EmptyState
            icon={<Users size={22} />}
            title="No hired workers yet"
            description="When you hire a candidate from your applicant pipeline, their contract details will appear here."
            action={
              <PostJobCTA
                planUsage={planUsage}
                label="Post a job"
                compact
              />
            }
          />
          <p className="text-center text-sm text-slate-500 font-medium">
            Or review applicants in your existing pipelines.{" "}
            <Link
              href="/employer/jobs"
              className="font-bold text-[#006e2f] hover:underline"
            >
              View job posts
            </Link>
          </p>
        </div>
      )}

      {workers.length > 0 ? (
        <EmployerSectionCard
          title="Grow your team"
          description="Post another role or review applicants in your pipelines."
          padded
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <PostJobCTA planUsage={planUsage} />
            <Link
              href="/employer/jobs"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              View pipelines
            </Link>
          </div>
        </EmployerSectionCard>
      ) : null}
    </EmployerPageShell>
  );
}
