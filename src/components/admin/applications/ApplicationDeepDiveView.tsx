import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { ApplicationRowActionsMenu } from "@/components/admin/applications/ApplicationRowActionsMenu";
import { ApplicationAuditScroll } from "@/components/admin/applications/ApplicationAuditScroll";
import { OpenResumeButton } from "@/components/admin/applications/OpenResumeButton";
import type { AdminApplicationDeepDive } from "@/types/admin.types";

interface ApplicationDeepDiveViewProps {
  data: AdminApplicationDeepDive;
  section?: string | null;
}

export function ApplicationDeepDiveView({
  data,
  section,
}: ApplicationDeepDiveViewProps) {
  return (
    <div className="space-y-6 min-w-0">
      <ApplicationAuditScroll section={section} />

      <div className="flex justify-end min-w-0">
        <ApplicationRowActionsMenu
          applicationId={data.id}
          workerLabel={data.workerName ?? "Worker"}
          moderationStatus={data.moderationStatus}
        />
      </div>

      <header className="space-y-3 min-w-0">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl min-w-0 break-words">
            {data.jobTitle ?? "Application"}
          </h2>
          <StatusBadge status={data.status} />
          {data.moderationStatus !== "clear" ? (
            <StatusBadge status={data.moderationStatus} />
          ) : null}
        </div>
        {data.applicationSubject ? (
          <p className="text-sm text-slate-600 min-w-0 break-words">
            {data.applicationSubject}
          </p>
        ) : null}
        <p className="text-xs text-slate-400">
          Applied {new Date(data.createdAt).toLocaleString()} · Match{" "}
          <span className="font-mono text-slate-600">{data.matchScore}%</span>
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Worker
          </p>
          <Link
            href={`/admin/users/workers/${data.workerId}`}
            className="mt-1 inline-flex max-w-full items-center gap-1.5 text-sm font-bold text-emerald-700 hover:underline min-w-0"
          >
            <span className="truncate">{data.workerName ?? "View worker"}</span>
            <VerifiedBadge show={data.workerIsVerified} size="sm" />
          </Link>
          {data.workerEmail ? (
            <a
              href={`mailto:${data.workerEmail}`}
              className="mt-1 block truncate text-xs text-slate-500 hover:text-emerald-700 hover:underline"
              title={data.workerEmail}
            >
              {data.workerEmail}
            </a>
          ) : null}
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Employer
          </p>
          {data.employerId ? (
            <Link
              href={`/admin/users/employers/${data.employerId}`}
              className="mt-1 block truncate text-sm font-bold text-emerald-700 hover:underline"
            >
              {data.companyName ?? "View employer"}
            </Link>
          ) : (
            <p className="mt-1 text-sm font-medium text-slate-900">
              {data.companyName ?? "—"}
            </p>
          )}
          <Link
            href={`/admin/jobs/${data.jobId}`}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-700"
          >
            View job
            <ExternalLink className="h-3 w-3" aria-hidden />
          </Link>
        </div>
      </div>

      {data.moderationStatus !== "clear" ? (
        <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-4 sm:p-5 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-700">
            Moderation
          </p>
          <p className="mt-1 text-sm font-semibold text-orange-900 capitalize">
            {data.moderationStatus}
          </p>
          {data.flagReason ? (
            <p className="mt-2 whitespace-pre-wrap text-sm text-orange-900/80">
              {data.flagReason}
            </p>
          ) : null}
          {data.flaggedAt ? (
            <p className="mt-2 text-xs text-orange-700/70">
              Flagged {new Date(data.flaggedAt).toLocaleString()}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Cover letter
        </p>
        <pre className="mt-2 max-h-[50dvh] overflow-y-auto whitespace-pre-wrap break-words text-sm text-slate-800 overscroll-contain">
          {data.coverLetter?.trim() || "No cover letter provided."}
        </pre>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Resume
        </p>
        {data.hasWorkerResume || data.workerResumeUrl ? (
          <OpenResumeButton
            applicationId={data.id}
            initialUrl={data.workerResumeUrl}
          />
        ) : (
          <p className="mt-2 text-sm text-slate-500">No resume on file.</p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Stage history
        </p>
        {data.stageHistory.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No stage changes recorded yet.</p>
        ) : (
          <ol className="mt-4 space-y-3">
            {data.stageHistory.map((event, index) => (
              <li
                key={`${event.status}-${event.createdAt}-${index}`}
                className="flex gap-3 min-w-0"
              >
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={event.status} />
                    {event.actorRole ? (
                      <span className="text-xs text-slate-400 capitalize">
                        by {event.actorRole}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(event.createdAt).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div
        id="audit-log"
        className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 min-w-0"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Audit log
        </p>
        {data.auditEvents.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            No admin audit events for this application yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {data.auditEvents.map((event) => (
              <li
                key={event.id}
                className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 min-w-0"
              >
                <p className="text-sm font-semibold text-slate-800 break-words">
                  {event.actionType}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {new Date(event.createdAt).toLocaleString()}
                </p>
                {event.metadata?.reason ? (
                  <p className="mt-1.5 text-xs text-slate-600 break-words">
                    {String(event.metadata.reason)}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
