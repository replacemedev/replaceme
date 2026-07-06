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
        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-800 text-white rounded-3xl p-6 shadow-xl border border-white/10 ring-1 ring-white/10 relative overflow-hidden space-y-5">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/80 text-emerald-50 text-[10px] font-black uppercase tracking-wider mb-2 border border-emerald-600/30">
                <Calendar size={11} />
                Interview Scheduled
              </span>
              <h2 className="text-xl font-extrabold tracking-tight text-white">Upcoming Interview Details</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-emerald-800/60 relative z-10">
            <div>
              <p className="text-xs text-emerald-200/80 font-bold uppercase tracking-wide">Date & Time</p>
              <p className="text-sm font-black mt-1 text-emerald-50">
                {new Date(application.interview.scheduledAt).toLocaleString(undefined, {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
            </div>
            {application.interview.meetingUrl && (
              <div className="min-w-0">
                <p className="text-xs text-emerald-200/80 font-bold uppercase tracking-wide">Meeting Link</p>
                <p className="text-xs font-semibold mt-1 break-all select-all text-emerald-100 hover:text-white transition-colors">
                  {application.interview.meetingUrl}
                </p>
              </div>
            )}
          </div>

          {application.interview.notes && (
            <div className="bg-emerald-950/40 border border-white/5 rounded-2xl p-4 text-xs relative z-10 text-emerald-50 leading-relaxed">
              <p className="font-bold text-xs text-emerald-200/80 uppercase tracking-wide mb-1.5">Employer Notes</p>
              {application.interview.notes}
            </div>
          )}

          {/* Translucent Glassmorphism Agent Skills badges */}
          <div className="pt-4 border-t border-emerald-800/60 relative z-10">
            <p className="text-xs text-emerald-200/80 font-bold uppercase tracking-wide mb-2.5">Matched Agent Skills</p>
            <div className="flex flex-wrap gap-2">
              {["Ponytail", "Fast-Typer", "Bilingual"].map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/15 text-[11px] font-semibold tracking-wide shadow-sm select-none hover:bg-white/15 transition-all cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {application.interview.meetingUrl && (
            <div className="pt-2 relative z-10">
              <a
                href={application.interview.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white hover:bg-slate-50 text-emerald-900 font-bold text-xs w-full sm:w-auto px-6 transition-all duration-200 shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
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
