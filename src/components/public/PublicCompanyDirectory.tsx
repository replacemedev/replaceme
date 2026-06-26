import { PUBLIC_PAGE_TOP } from "@/lib/layout/public-shell";
import Link from "next/link";
import Image from "next/image";
import type { PublicCompanyListing } from "@/types/public-growth";

interface PublicCompanyDirectoryProps {
  companies: PublicCompanyListing[];
}

export function PublicCompanyDirectory({
  companies,
}: PublicCompanyDirectoryProps) {
  return (
    <div className={`max-w-6xl mx-auto px-4 sm:px-8 pb-10 ${PUBLIC_PAGE_TOP}`}>
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Company Directory
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Employers currently hiring on ReplaceMe.
        </p>
      </header>

      {companies.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <p className="text-sm font-semibold text-slate-800">
            No companies with active jobs yet
          </p>
          <Link
            href="/signup"
            className="inline-flex mt-5 px-5 py-2.5 text-sm font-bold text-white bg-[#006e2f] rounded-xl"
          >
            Post a job as employer
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <li key={company.id}>
              <Link
                href={`/companies/${company.id}`}
                className="block h-full bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-600">
                    {company.logoUrl ? (
                      <Image
                        src={company.logoUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      company.companyName.charAt(0)
                    )}
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 line-clamp-2">
                    {company.companyName}
                  </h2>
                </div>
                {company.industry ? (
                  <p className="text-xs text-slate-500">{company.industry}</p>
                ) : null}
                <p className="mt-2 text-xs font-semibold text-[#006e2f]">
                  {company.activeJobCount} active job
                  {company.activeJobCount === 1 ? "" : "s"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
