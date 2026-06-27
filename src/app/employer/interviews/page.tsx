import Link from "next/link";
import { Calendar } from "lucide-react";
import { getEmployerInterviews } from "@/actions/employer/hiring";
import { getEmployerPlanUsage } from "@/actions/employer/billing";
import { EmptyState } from "@/components/shared/EmptyState";
import { PlanUsageStrip } from "@/components/shared/entitlements/PlanUsageStrip";
import { ContextualUpgradeBanner } from "@/components/shared/entitlements/ContextualUpgradeBanner";
import { InterviewCard } from "@/components/employer/interviews/InterviewCard";
import {
  interviewsPageSubhead,
  normalizePlanSlug,
} from "@/lib/entitlements/ui-copy";

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
    <div className="py-12 px-margin-desktop max-w-container-max mx-auto w-full space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Interviews
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium max-w-2xl">
          {interviewsPageSubhead(
            planSlug,
            interviews.length,
            messagingEnabled
          )}
        </p>
      </div>

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
          actionLabel="View jobs"
          actionHref="/employer/jobs"
        />
      ) : (
        <ul className="space-y-4">
          {interviews.map((item) => (
            <InterviewCard
              key={item.applicationId}
              interview={item}
              planSlug={planSlug}
              messagingEnabled={messagingEnabled}
            />
          ))}
        </ul>
      )}

      {interviews.length > 0 ? (
        <p className="text-center text-xs font-medium text-slate-400 pt-2">
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
    </div>
  );
}
