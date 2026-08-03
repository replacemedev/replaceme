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

export function PublicJobDetail({ job, faqs }: PublicJobDetailProps) {
  return (
    <div className="min-h-screen bg-[#f4f7f6] pb-28 md:pb-12">
      <header className="relative bg-[#0a4a29] text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M10 0h2v2h-2V0zm0 18h2v2h-2v-2zM0 10h2v2H0v-2zm18 0h2v2h-2v-2zM4 4h2v2H4V4zm10 0h2v2h-2V4zM4 14h2v2H4v-2zm10 0h2v2h-2v-2z'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
          aria-hidden
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 md:pt-10 pb-20 sm:pb-24">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight leading-tight">
              {job.title}
            </h1>
            <p className="mt-3 text-sm sm:text-base font-medium text-white/80">
              {job.companyName} • Posted on {formatPostedDate(job.createdAt)}
            </p>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto -mt-12 sm:-mt-16 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
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
      question: "What happens after I apply?",
      answer: `${job.companyName} reviews applications and may follow up through Replaceme messaging. Typical steps include profile review, a skills or culture screen, and a final conversation before an offer.`,
    },
  ];
}
