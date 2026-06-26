import { redirect } from "next/navigation";
import { Award } from "lucide-react";
import { getSkillAssessments } from "@/actions/worker/phase2";
import { EmptyState } from "@/components/shared/EmptyState";

export const metadata = {
  title: "Skill Assessments | ReplaceMe",
};

export const dynamic = "force-dynamic";

export default async function WorkerTestsPage() {
  const assessments = await getSkillAssessments();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-2xl font-extrabold text-slate-900">Skill Assessments</h1>
      <p className="text-sm text-slate-500 mt-1 mb-8">
        Prove your expertise with free assessments employers trust.
      </p>

      {assessments.length === 0 ? (
        <EmptyState
          icon={<Award size={22} />}
          title="No assessments available"
          description="New skill tests will be published here as they become available."
        />
      ) : (
        <ul className="space-y-4">
          {assessments.map((test) => (
            <li
              key={test.id}
              className="bg-white border border-slate-200 rounded-2xl p-5"
            >
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
    </div>
  );
}
