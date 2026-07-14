import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { JobOverviewCard } from "@/components/worker/jobs/details/JobOverviewCard";
import { JobSidebarCards } from "@/components/worker/jobs/details/JobSidebarCards";
import { PublicJobAuthWall } from "@/components/public/PublicJobAuthWall";
import {
  formatCompensation,
  formatPostedDate,
  type WorkerJobDetails,
} from "@/types/job-details";
import type { FAQItem } from "@/components/seo";

interface PublicJobDetailProps {
  job: WorkerJobDetails;
  faqs: FAQItem[];
}

/** GEO: declarative answers + lists in initial HTML (no client tabs). */
export function PublicJobDetail({ job, faqs }: PublicJobDetailProps) {
  const compensation = formatCompensation(
    job.monthlySalary,
    job.salaryCurrency,
    job.hoursPerWeek
  );
  const salaryLine =
    job.monthlySalary > 0
      ? `The base salary for this role is ${compensation}.`
      : "Compensation for this role is listed as competitive and confirmed during hiring.";

  return (
    <div className="min-h-screen bg-[#f4f7f6] pb-28 md:pb-12">
      <header className="bg-[#0a4a29] text-white">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-5 sm:px-6 sm:pb-20 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-white/90">
              <li>
                <Link href="/jobs" className="inline-flex items-center gap-1.5 hover:text-white">
                  <ArrowLeft size={14} aria-hidden />
                  Job board
                </Link>
              </li>
              <li aria-hidden className="text-white/50">
                /
              </li>
              <li className="truncate text-white" aria-current="page">
                {job.title}
              </li>
            </ol>
          </nav>

          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
              {job.title}
            </h1>
            <p className="mt-2 text-sm font-medium text-white/80 sm:text-base">
              {job.companyName} • Posted {formatPostedDate(job.createdAt)}
            </p>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto -mt-8 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section
              className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8"
              aria-labelledby="job-summary-heading"
            >
              <h2
                id="job-summary-heading"
                className="text-sm font-extrabold uppercase tracking-wider text-slate-800"
              >
                In summary
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-700">
                The key takeaway is that {job.companyName} is hiring a{" "}
                <strong>{job.title}</strong> ({job.employmentType}) based in{" "}
                {job.location}. {salaryLine} Apply directly on Replaceme with no
                agency fees.
              </p>
              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-[#f4f7f6] px-4 py-3">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Employment type
                  </dt>
                  <dd className="mt-1 text-sm font-bold text-slate-900">
                    {job.employmentType}
                  </dd>
                </div>
                <div className="rounded-xl bg-[#f4f7f6] px-4 py-3">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Location
                  </dt>
                  <dd className="mt-1 text-sm font-bold text-slate-900">
                    {job.location}
                  </dd>
                </div>
                <div className="rounded-xl bg-[#f4f7f6] px-4 py-3 sm:col-span-2">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Compensation
                  </dt>
                  <dd className="mt-1 text-sm font-extrabold text-[#006e2f]">
                    {job.monthlySalary > 0 ? compensation : "Competitive — confirm with employer"}
                  </dd>
                </div>
              </dl>
            </section>

            <JobOverviewCard job={job} />

            {job.skills.length > 0 ? (
              <section
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
                aria-labelledby="skills-heading"
              >
                <h2
                  id="skills-heading"
                  className="text-sm font-extrabold uppercase tracking-wider text-slate-800"
                >
                  Required skills
                </h2>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700 sm:text-[15px]">
                  {job.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <PublicJobAuthWall jobId={job.id} variant="inline" />

            {faqs.length > 0 ? (
              <section
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
                aria-labelledby="job-faq-heading"
              >
                <h2
                  id="job-faq-heading"
                  className="text-sm font-extrabold uppercase tracking-wider text-slate-800"
                >
                  Frequently asked questions
                </h2>
                <div className="mt-5 space-y-5">
                  {faqs.map((faq) => (
                    <div key={faq.question}>
                      <h3 className="text-sm font-bold text-slate-900">
                        {faq.question}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
          <JobSidebarCards job={job} />
        </div>
      </main>

      <PublicJobAuthWall jobId={job.id} variant="sticky" />
    </div>
  );
}

/** AEO FAQ copy shared by visible HTML + FAQPage JSON-LD. */
export function buildJobFaqs(job: WorkerJobDetails): FAQItem[] {
  const compensation = formatCompensation(
    job.monthlySalary,
    job.salaryCurrency,
    job.hoursPerWeek
  );

  return [
    {
      question: `What is the salary for the ${job.title} role at ${job.companyName}?`,
      answer:
        job.monthlySalary > 0
          ? `The base salary for this role is ${compensation}. Final packaging may be confirmed during the hiring process on Replaceme.`
          : `Compensation for the ${job.title} role at ${job.companyName} is competitive and confirmed directly with the employer on Replaceme.`,
    },
    {
      question: "Is this role remote?",
      answer: /remote|work\s*from\s*home|wfh|anywhere/i.test(job.location)
        ? `Yes. This ${job.employmentType} role is listed as ${job.location} and is open to qualified Filipino professionals.`
        : `This ${job.employmentType} role is based in ${job.location}. Check the job details for onsite or hybrid requirements.`,
    },
    {
      question: "How do I apply on Replaceme?",
      answer:
        "Create a free worker account on Replaceme, complete your profile, then apply directly from this job page. There are no agency fees for workers.",
    },
    {
      question: "What is the interview process?",
      answer: `${job.companyName} manages screening and interviews directly through Replaceme messaging after you apply. Typical steps include profile review, a skills or culture screen, and a final conversation before an offer.`,
    },
  ];
}
