import Link from "next/link";
import { Calendar } from "lucide-react";
import { getWorkerInterviews } from "@/actions/worker/phase2";
import { EmptyState } from "@/components/shared/EmptyState";

export const metadata = {
  title: "Interviews | ReplaceMe",
};

export const dynamic = "force-dynamic";

export default async function WorkerInterviewsPage() {
  const interviews = await getWorkerInterviews();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-2xl font-extrabold text-slate-900">Interviews</h1>
      <p className="text-sm text-slate-500 mt-1 mb-8">
        Upcoming interview invites and scheduling.
      </p>

      {interviews.length === 0 ? (
        <EmptyState
          icon={<Calendar size={22} />}
          title="No interviews scheduled"
          description="When an employer schedules an interview, it will show up here."
          actionLabel="View applications"
          actionHref="/worker/applications"
        />
      ) : (
        <ul className="space-y-4">
          {interviews.map((item) => (
            <li
              key={item.applicationId}
              className="bg-white border border-slate-200 rounded-2xl p-5"
            >
              <p className="text-sm font-bold text-slate-900">{item.jobTitle}</p>
              <p className="text-sm text-slate-500">{item.companyName}</p>
              <p className="text-xs text-slate-400 mt-2">
                Scheduled: {new Date(item.scheduledAt).toLocaleString()}
              </p>
              <Link
                href={`/worker/applications/${item.applicationId}`}
                className="inline-flex mt-3 text-xs font-bold text-[#006e2f] hover:underline"
              >
                View application
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
