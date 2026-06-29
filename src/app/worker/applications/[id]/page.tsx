import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, MessageSquare } from "lucide-react";
import {
  getWorkerApplicationById,
  getApplicationStageHistory,
} from "@/actions/worker/applications";
import { getWorkerApplicationMessaging } from "@/actions/messaging";
import {
  APPLICATION_STATUS_LABELS,
  formatHourlyRate,
  getStatusBadge,
} from "@/types/applications";
import {
  WorkerPageShell,
  WorkerPageHeader,
  WorkerSectionCard,
} from "@/components/worker/layout";
import { ApplicationTimeline } from "@/components/worker/applications/ApplicationTimeline";
import { WithdrawApplicationButton } from "@/components/worker/applications/WithdrawApplicationButton";
import { WORKER_CARD } from "@/lib/worker/ui-tokens";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkerApplicationDetailPage({
  params,
}: PageProps) {
  const { id } = await params;
  const [application, stageHistory] = await Promise.all([
    getWorkerApplicationById(id),
    getApplicationStageHistory(id),
  ]);

  if (!application) notFound();

  const messaging = await getWorkerApplicationMessaging(application.jobId);

  const { label } = getStatusBadge(application.status);

  const timeline =
    stageHistory.length > 0
      ? stageHistory.map((event) => ({
          label: `Status: ${APPLICATION_STATUS_LABELS[event.status]}`,
          at: event.createdAt,
        }))
      : [
          { label: "Application submitted", at: application.createdAt },
          { label: `Status: ${label}`, at: application.createdAt },
        ];

  return (
    <WorkerPageShell width="content">
      <WorkerPageHeader
        title={application.jobTitle}
        subhead={application.companyName}
        actions={
          <div className="flex flex-wrap gap-2">
            <WithdrawApplicationButton
              applicationId={application.id}
              status={application.status}
            />
            {messaging?.threadId ? (
              <Link
                href={`/worker/messages?threadId=${messaging.threadId}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:border-[#006e2f]/30 hover:text-[#006e2f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 focus-visible:ring-offset-2"
              >
                <MessageSquare size={14} aria-hidden />
                Messages
              </Link>
            ) : (
              <span
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 px-4 text-xs font-bold text-slate-400"
                title="Available after the employer sends the first message"
              >
                <MessageSquare size={14} aria-hidden />
                Awaiting employer message
              </span>
            )}
            {application.status === "INTERVIEW_SCHEDULED" ? (
              <Link
                href="/worker/interviews"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#006e2f] px-4 text-xs font-bold text-white hover:bg-[#005c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 focus-visible:ring-offset-2"
              >
                <Calendar size={14} aria-hidden />
                View interview
              </Link>
            ) : null}
          </div>
        }
      />

      <article className={`${WORKER_CARD} p-6 space-y-6`}>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold text-[#006e2f]">
            {formatHourlyRate(application.hourlyRate)}
          </p>
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
            {label}
          </span>
        </div>

        <WorkerSectionCard title="Timeline" className="border-0 shadow-none p-0">
          <ApplicationTimeline events={timeline} />
        </WorkerSectionCard>
      </article>
    </WorkerPageShell>
  );
}
