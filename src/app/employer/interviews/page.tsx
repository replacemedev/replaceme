import Link from "next/link";
import { Calendar } from "lucide-react";
import { getEmployerInterviews } from "@/actions/employer/hiring";
import { EmptyState } from "@/components/shared/EmptyState";

export const metadata = {
  title: "Interviews | ReplaceMe",
};

export const dynamic = "force-dynamic";

export default async function EmployerInterviewsPage() {
  const interviews = await getEmployerInterviews();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-2xl font-extrabold text-slate-900">Interviews</h1>
      <p className="text-sm text-slate-500 mt-1 mb-8">
        Candidates you have moved to interview stage across all jobs.
      </p>

      {interviews.length === 0 ? (
        <EmptyState
          icon={<Calendar size={22} />}
          title="No interviews scheduled"
          description="Schedule interviews from an applicant pipeline to see them here."
          actionLabel="View jobs"
          actionHref="/employer/jobs"
        />
      ) : (
        <ul className="space-y-4">
          {interviews.map((item) => (
            <li
              key={item.applicationId}
              className="bg-white border border-slate-200 rounded-2xl p-5"
            >
              <p className="text-sm font-bold text-slate-900">{item.candidateName}</p>
              <p className="text-sm text-slate-500">{item.jobTitle}</p>
              <p className="text-xs text-slate-400 mt-2">
                Scheduled: {new Date(item.scheduledAt).toLocaleString()}
              </p>
              <Link
                href={`/employer/jobs/${item.jobId}/applicants`}
                className="inline-flex mt-3 text-xs font-bold text-[#006e2f] hover:underline"
              >
                View pipeline
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
