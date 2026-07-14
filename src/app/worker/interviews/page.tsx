import { Calendar } from "lucide-react";
import { getWorkerInterviews } from "@/actions/worker/phase2";
import { EmptyState } from "@/components/shared/EmptyState";
import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";
import { WorkerInterviewsList } from "@/components/worker/interviews/WorkerInterviewsList";
import { groupWorkerInterviewsByWeek } from "@/lib/worker/interviews";

export const metadata = {
  title: "Interviews | Replaceme",
};

export const dynamic = "force-dynamic";

export default async function WorkerInterviewsPage() {
  const interviews = await getWorkerInterviews();
  const groups = groupWorkerInterviewsByWeek(interviews);

  return (
    <WorkerPageShell width="content">
      <WorkerPageHeader
        title="Interviews"
        subhead="Upcoming interview invites and scheduling details from employers."
      />

      {interviews.length === 0 ? (
        <EmptyState
          icon={<Calendar size={22} aria-hidden />}
          title="No interviews scheduled"
          description="When an employer schedules an interview, it will show up here."
          actionLabel="View applications"
          actionHref="/worker/applications"
        />
      ) : (
        <WorkerInterviewsList groups={groups} />
      )}
    </WorkerPageShell>
  );
}
