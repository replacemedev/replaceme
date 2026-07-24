import { PUBLIC_PAGE_TOP } from "@/lib/layout/public-shell";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LogoImage } from "@/components/shared/media/LogoImage";
import { getPublicCompanyById } from "@/actions/public/growth";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicCompanyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getPublicCompanyById(id);
  if (!data) notFound();

  const { company, jobs } = data;

  return (
    <div className={`max-w-4xl mx-auto px-4 sm:px-8 pb-10 ${PUBLIC_PAGE_TOP}`}>
      <Link
        href="/companies"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-6"
      >
        <ArrowLeft size={14} />
        All companies
      </Link>

      <header className="flex items-start gap-4 mb-8">
        <div className="relative w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0">
          <LogoImage
            src={company.logoUrl}
            alt=""
            label={company.companyName}
            sizePx={56}
            rounded="xl"
            colorClass="bg-slate-100 text-slate-600 text-lg"
            priority
          />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {company.companyName}
          </h1>
          {company.industry ? (
            <p className="text-sm text-slate-500 mt-1">{company.industry}</p>
          ) : null}
        </div>
      </header>

      {company.companyBio ? (
        <p className="text-sm text-slate-600 mb-8 leading-relaxed">
          {company.companyBio}
        </p>
      ) : null}

      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900 mb-4">
        Open roles ({jobs.length})
      </h2>
      <ul className="space-y-3">
        {jobs.map((job) => (
          <li key={job.id}>
            <Link
              href={`/jobs/${job.id}`}
              className="block bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-emerald-200"
            >
              <p className="text-sm font-bold text-slate-900">{job.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {job.employmentType} · {job.location}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
