import Link from "next/link";
import { Calendar } from "lucide-react";
import type { WorkerInterviewRow } from "@/lib/validations/worker/phase2";
import type { WorkerInterviewGroup } from "@/lib/worker/interviews";
import { WORKER_CARD } from "@/lib/worker/ui-tokens";
import { ClientFormattedDate } from "@/components/shared/ClientFormattedDate";

interface WorkerInterviewsListProps {
  groups: WorkerInterviewGroup[];
}

export function WorkerInterviewsList({ groups }: WorkerInterviewsListProps) {
  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.key} className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {group.label}
          </h2>
          <ul className="space-y-3">
            {group.items.map((item) => (
              <li key={item.interviewId}>
                <InterviewCard item={item} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function InterviewCard({ item }: { item: WorkerInterviewRow }) {
  return (
    <article className={`${WORKER_CARD} p-5`}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ebfdf2] text-[#006e2f]">
          <Calendar className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">{item.jobTitle}</p>
          <p className="text-sm text-slate-500">{item.companyName}</p>
          <p className="text-xs text-slate-400 mt-2">
            Scheduled: <ClientFormattedDate date={item.scheduledAt} />
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
            {item.meetingUrl ? (
              <a
                href={item.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#006e2f] hover:underline"
              >
                Join meeting
              </a>
            ) : null}
            <Link
              href={`/worker/applications/${item.applicationId}`}
              className="text-xs font-bold text-[#006e2f] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 focus-visible:ring-offset-2 rounded-sm"
            >
              View application
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
