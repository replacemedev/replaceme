import Link from "next/link";
import { Calendar } from "lucide-react";
import { getEmployerInterviews } from "@/actions/employer/hiring";
import { getEmployerPlanUsage } from "@/actions/employer/billing";
import { EmptyState } from "@/components/shared/EmptyState";
import { PlanUsageStrip } from "@/components/shared/entitlements/PlanUsageStrip";
import { ContextualUpgradeBanner } from "@/components/shared/entitlements/ContextualUpgradeBanner";
import { EmployerInterviewsClient } from "@/components/employer/interviews/EmployerInterviewsClient";
import {
  interviewsPageSubhead,
  normalizePlanSlug,
} from "@/lib/entitlements/ui-copy";
import {
  EmployerPageHeader,
  EmployerPageShell,
} from "@/components/employer/layout";

export const metadata = {
  title: "Interviews | ReplaceMe",
  description:
    "Candidates you have moved to interview stage across all jobs.",
};

export const dynamic = "force-dynamic";

export default async function EmployerInterviewsPage() {
  const [interviews, planUsage] = await Promise.all([
    getEmployerInterviews(),
    getEmployerPlanUsage(),
  ]);

  const planSlug = normalizePlanSlug(planUsage?.planSlug ?? "discovery");
  const messagingEnabled = planUsage?.messagingEnabled ?? false;
  const isPreview = planUsage?.identityMode === "anonymous_preview";

  return (
    <EmployerPageShell>
      <EmployerPageHeader
        title="Interviews"
        subhead={interviewsPageSubhead(
          planSlug,
          interviews.length,
          messagingEnabled
        )}
      />

      {planUsage ? <PlanUsageStrip usage={planUsage} /> : null}

      {!messagingEnabled && interviews.length > 0 ? (
        <ContextualUpgradeBanner feature="messaging" currentPlan={planSlug} />
      ) : null}

      {isPreview && interviews.length > 0 ? (
        <ContextualUpgradeBanner feature="identity" currentPlan={planSlug} />
      ) : null}

      {interviews.length === 0 ? (
        <EmptyState
          icon={<Calendar size={22} />}
          title="No interviews scheduled"
          description="Move candidates to Interview Scheduled in an applicant pipeline to see them here."
          actionLabel="View job pipelines"
          actionHref="/employer/jobs"
        />
      ) : (
        <EmployerInterviewsClient
          interviews={interviews}
          planSlug={planSlug}
          messagingEnabled={messagingEnabled}
        />
      )}

      {interviews.length > 0 ? (
        <p className="text-center text-xs font-medium text-slate-400 pt-6">
          Need to schedule more? Open a{" "}
          <Link
            href="/employer/jobs"
            className="font-bold text-[#006e2f] hover:underline"
          >
            job pipeline
          </Link>{" "}
          and update applicant status.
        </p>
      ) : null}
    </EmployerPageShell>
  );
}
