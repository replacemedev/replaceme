import { FileText, Check, Star, ArrowRight } from "lucide-react";
import {
  WorkerJobDetails,
  buildListSections,
  formatCompensation,
  JobListIcon,
} from "@/types/job-details";

interface JobOverviewCardProps {
  job: WorkerJobDetails;
}

function ListIcon({ type }: { type: JobListIcon }) {
  const className = "h-3.5 w-3.5 text-blue-600";
  if (type === "star") return <Star className={className} aria-hidden />;
  if (type === "arrow") return <ArrowRight className={className} aria-hidden />;
  return <Check className={className} aria-hidden />;
}

export function JobOverviewCard({ job }: JobOverviewCardProps) {
  const sections = buildListSections(job.parsedSections);
  const hasStructuredContent =
    job.parsedSections.introParagraphs.length > 0 || sections.length > 0;

  return (
    <article className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
      <header className="flex items-center gap-2 pb-4 mb-6 border-b border-slate-100">
        <FileText className="h-5 w-5 text-[#006e2f]" aria-hidden />
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
          Job Overview
        </h2>
      </header>

      {hasStructuredContent ? (
        <div className="space-y-6 text-slate-700 text-sm sm:text-[15px] leading-relaxed">
          {job.parsedSections.introParagraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}

          {sections.map((section) => (
            <section key={section.title}>
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 border border-blue-100">
                      <ListIcon type={section.icon} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {section.footnote && (
                <p className="mt-3 text-xs italic text-slate-500">
                  {section.footnote}
                </p>
              )}
            </section>
          ))}
        </div>
      ) : (
        <div className="text-slate-700 text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap">
          {job.description}
        </div>
      )}

      <aside className="mt-8 rounded-xl bg-violet-50 border border-violet-100 p-5">
        <p className="text-sm font-semibold text-slate-800">
          Compensation:{" "}
          <span className="text-[#006e2f] font-extrabold">
            {formatCompensation(job.monthlySalary)}
          </span>
        </p>
        <p className="mt-1 text-xs text-slate-500">
          with opportunities to increase based on workload and quality.
        </p>
      </aside>
    </article>
  );
}
