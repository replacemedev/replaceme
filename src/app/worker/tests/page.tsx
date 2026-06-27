import { redirect } from "next/navigation";
import { Award } from "lucide-react";
import { getSkillAssessments } from "@/actions/worker/phase2";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  WorkerPageShell,
  WorkerPageHeader,
  WorkerBreadcrumb,
} from "@/components/worker/layout";
import { WORKER_CARD } from "@/lib/worker/ui-tokens";

export const metadata = {
  title: "Skill Assessments | ReplaceMe",
};

export const dynamic = "force-dynamic";

export default async function WorkerTestsPage() {
  const assessments = await getSkillAssessments();

  return (
    <WorkerPageShell width="narrow">
      <WorkerBreadcrumb
        items={[
          { label: "Dashboard", href: "/worker/dashboard" },
          { label: "Skill assessments" },
        ]}
      />
      <WorkerPageHeader
        title="Skill assessments"
        subhead="Prove your expertise with free assessments employers trust."
      />

      {assessments.length === 0 ? (
        <EmptyState
          icon={<Award size={22} aria-hidden />}
          title="No assessments available"
          description="New skill tests will be published here as they become available."
        />
      ) : (
        <ul className="space-y-4">
          {assessments.map((test) => (
            <li key={test.id} className={`${WORKER_CARD} p-5`}>
              <p className="text-sm font-bold text-slate-900">{test.title}</p>
              <p className="text-xs font-semibold text-[#006e2f] mt-1">
                {test.skillName} · {test.durationMinutes} min
              </p>
              {test.description ? (
                <p className="text-sm text-slate-500 mt-2">{test.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </WorkerPageShell>
  );
}
