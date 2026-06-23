import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  computeJobHourlyRate,
  formatSalaryBadge,
  daysSincePosted,
} from "@/types/job-search";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default async function WorkerJobDetailPage({ params }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  const { jobId } = await params;

  const { data: job } = await supabase
    .from("job_posts")
    .select("*")
    .eq("id", jobId)
    .eq("status", "Active")
    .maybeSingle();

  if (!job?.title) notFound();

  const monthlySalary = Number(job.monthly_salary ?? 0);
  const hoursPerWeek = Number(job.hours_per_week ?? 0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/worker/jobs"
        className="text-sm font-semibold text-[#006e2f] hover:underline mb-6 inline-block"
      >
        ← Back to Job Search
      </Link>

      <article className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          {job.company_name}
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">
          {job.title}
        </h1>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="rounded-md bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase">
            {(job.employment_type ?? "").toUpperCase()}
          </span>
          <span className="rounded-md bg-[#ebfdf2] border border-[#006e2f]/15 px-2 py-0.5 text-[10px] font-bold text-[#006e2f] uppercase">
            {formatSalaryBadge(monthlySalary, hoursPerWeek)}
          </span>
          <span className="rounded-md bg-slate-50 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
            {(job.location ?? "Remote").toUpperCase()}
          </span>
        </div>

        <p className="text-sm text-slate-500 mb-6">
          {job.created_at ? daysSincePosted(job.created_at) : ""}
          {computeJobHourlyRate(monthlySalary, hoursPerWeek)
            ? ` · ₱${computeJobHourlyRate(monthlySalary, hoursPerWeek)!.toLocaleString("en-US")}/hr`
            : ""}
        </p>

        <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
          {job.description}
        </div>

        {(job.skills ?? []).length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2">
            {(job.skills ?? []).map((skill: string) => (
              <li
                key={skill}
                className="rounded-md bg-slate-50 border border-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"
              >
                {skill}
              </li>
            ))}
          </ul>
        )}
      </article>
    </div>
  );
}
