import Link from "next/link";
import { Calendar } from "lucide-react";
import { getEmployerInterviews } from "@/actions/employer/hiring";
import { getEmployerPlanUsage } from "@/actions/employer/billing";
import { EmptyState } from "@/components/shared/EmptyState";
import { PlanUsageStrip } from "@/components/shared/entitlements/PlanUsageStrip";
import { ContextualUpgradeBanner } from "@/components/shared/entitlements/ContextualUpgradeBanner";
import { InterviewCard } from "@/components/employer/interviews/InterviewCard";
import { InterviewsCalendarHeader } from "@/components/employer/interviews/InterviewsCalendarHeader";
import {
  interviewsPageSubhead,
  normalizePlanSlug,
} from "@/lib/entitlements/ui-copy";
import {
  groupInterviewsByWeek,
  INTERVIEW_BUCKET_LABELS,
  type InterviewWeekBucket,
} from "@/lib/employer/interviews";
import {
  EmployerPageHeader,
  EmployerPageShell,
  EmployerBreadcrumb,
} from "@/components/employer/layout";

export const metadata = {
  title: "Interviews | ReplaceMe",
  description:
    "Candidates you have moved to interview stage across all jobs.",
};

export const dynamic = "force-dynamic";

const BUCKET_ORDER: InterviewWeekBucket[] = [
  "this_week",
  "upcoming",
  "past",
];

export default async function EmployerInterviewsPage() {
  const [interviews, planUsage] = await Promise.all([
    getEmployerInterviews(),
    getEmployerPlanUsage(),
  ]);

  const planSlug = normalizePlanSlug(planUsage?.planSlug ?? "discovery");
  const messagingEnabled = planUsage?.messagingEnabled ?? false;
  const isPreview = planUsage?.identityMode === "anonymous_preview";
  const grouped = groupInterviewsByWeek(interviews);

  return (
    <EmployerPageShell>
      <EmployerBreadcrumb
        items={[
          { label: "Dashboard", href: "/employer/dashboard" },
          { label: "Interviews" },
        ]}
      />
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
        <div className="space-y-8">
          <InterviewsCalendarHeader interviews={interviews} />

          {BUCKET_ORDER.map((bucket) => {
            const items = grouped[bucket];
            if (items.length === 0) return null;

            return (
              <section key={bucket} className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
                    {INTERVIEW_BUCKET_LABELS[bucket]}
                  </h2>
                  <span className="text-xs font-bold text-slate-400 tabular-nums">
                    {items.length}
                  </span>
                </div>
                <ul className="space-y-4">
                  {items.map((item) => (
                    <InterviewCard
                      key={item.applicationId}
                      interview={item}
                      planSlug={planSlug}
                      messagingEnabled={messagingEnabled}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
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
    </EmployerPageShell>
  );
}
