import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, MessageSquare } from "lucide-react";
import { getWorkerApplicationById } from "@/actions/worker/applications";
import {
  formatHourlyRate,
  getStatusBadge,
} from "@/types/applications";
import {
  WorkerPageShell,
  WorkerPageHeader,
  WorkerBreadcrumb,
  WorkerSectionCard,
} from "@/components/worker/layout";
import { ApplicationTimeline } from "@/components/worker/applications/ApplicationTimeline";
import { WORKER_CARD } from "@/lib/worker/ui-tokens";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkerApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const application = await getWorkerApplicationById(id);

  if (!application) notFound();

  const { label } = getStatusBadge(application.status);

  const timeline = [
    { label: "Application submitted", at: application.createdAt },
    { label: `Status: ${label}`, at: application.createdAt },
  ];

  return (
    <WorkerPageShell width="content">
      <WorkerBreadcrumb
        items={[
          { label: "Dashboard", href: "/worker/dashboard" },
          { label: "Applications", href: "/worker/applications" },
          { label: application.jobTitle },
        ]}
      />

      <WorkerPageHeader
        title={application.jobTitle}
        subhead={application.companyName}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/worker/messages"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:border-[#006e2f]/30 hover:text-[#006e2f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 focus-visible:ring-offset-2"
            >
              <MessageSquare size={14} aria-hidden />
              Messages
            </Link>
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
