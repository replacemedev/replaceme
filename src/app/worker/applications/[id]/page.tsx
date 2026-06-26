import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, ArrowLeft } from "lucide-react";
import { getWorkerApplicationById } from "@/actions/worker/applications";
import {
  formatHourlyRate,
  getStatusBadge,
} from "@/types/applications";

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
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
      <Link
        href="/worker/applications"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6"
      >
        <ArrowLeft size={14} />
        Back to applications
      </Link>

      <h1 className="text-2xl font-extrabold text-slate-900">Application Detail</h1>
      <p className="text-sm text-slate-500 mt-1 mb-8">
        Track status and timeline for this application.
      </p>

      <article className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
        <header>
          <h2 className="text-lg font-bold text-slate-900">{application.jobTitle}</h2>
          <p className="text-sm text-slate-500">{application.companyName}</p>
          <p className="mt-2 text-sm font-semibold text-[#006e2f]">
            {formatHourlyRate(application.hourlyRate)}
          </p>
          <span className="inline-flex mt-3 items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
            {label}
          </span>
        </header>

        <section>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
            Timeline
          </h3>
          <ol className="space-y-4">
            {timeline.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(item.at).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <Link
          href={`/worker/jobs/${application.jobId}`}
          className="inline-flex text-sm font-semibold text-[#006e2f] hover:underline"
        >
          View job posting
        </Link>
      </article>
    </div>
  );
}
