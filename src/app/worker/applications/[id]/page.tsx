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
import { ApplicationStepper } from "@/components/worker/applications/ApplicationStepper";
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

      {application.interview && (application.interview.status === "SCHEDULED" || application.interview.status === "scheduled") && (
        <div className="bg-[#006e2f] text-white rounded-3xl p-6 shadow-md border border-[#006e2f]/10 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700 text-emerald-50 text-xs font-bold uppercase tracking-wider mb-2">
                <Calendar size={12} />
                Interview Scheduled
              </span>
              <h2 className="text-xl font-extrabold tracking-tight">Upcoming Interview Details</h2>
            </div>
            <span className="text-xs font-semibold text-emerald-100 bg-emerald-850 px-3.5 py-1.5 rounded-xl border border-emerald-700/50">
              Scheduled via ReplaceMe
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-emerald-750">
            <div>
              <p className="text-xs text-emerald-200/90 font-bold uppercase tracking-wide">Date & Time</p>
              <p className="text-base font-black mt-0.5">
                {new Date(application.interview.scheduledAt).toLocaleString(undefined, {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
            </div>
            {application.interview.meetingUrl && (
              <div>
                <p className="text-xs text-emerald-200/90 font-bold uppercase tracking-wide">Meeting Link</p>
                <p className="text-sm font-semibold mt-0.5 truncate select-all">
                  {application.interview.meetingUrl}
                </p>
              </div>
            )}
          </div>

          {application.interview.notes && (
            <div className="bg-emerald-950/20 border border-emerald-750/30 rounded-2xl p-4 text-sm mt-2 text-emerald-50">
              <p className="font-bold text-xs text-emerald-200/80 uppercase tracking-wide mb-1">Employer Notes</p>
              {application.interview.notes}
            </div>
          )}

          {application.interview.meetingUrl && (
            <div className="pt-2">
              <a
                href={application.interview.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white hover:bg-slate-50 text-[#006e2f] font-bold text-sm w-full md:w-auto px-6 transition-all duration-200 shadow-sm hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                Join Meeting
              </a>
            </div>
          )}
        </div>
      )}

      <article className={`${WORKER_CARD} p-6 space-y-8`}>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100/60">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-[#006e2f]">
              {formatHourlyRate(application.hourlyRate)}
            </p>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
              {label}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-semibold">
            Applied on {new Date(application.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Responsive Progress Stepper */}
        <div className="py-2">
          <ApplicationStepper status={application.status} />
        </div>

        <WorkerSectionCard title="Application History" className="border-0 shadow-none p-0 pt-4 border-t border-slate-150/40">
          <ApplicationTimeline events={timeline} />
        </WorkerSectionCard>
      </article>
    </WorkerPageShell>
  );
}
