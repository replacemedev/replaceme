import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getEmployerCandidateProfile } from "@/actions/employer/hiring";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";

export const metadata = {
  title: "Candidate Profile | ReplaceMe",
};

export const dynamic = "force-dynamic";

export default async function EmployerCandidatePage({
  params,
  searchParams,
}: {
  params: Promise<{ candidateId: string }>;
  searchParams: Promise<{ jobId?: string }>;
}) {
  const { candidateId } = await params;
  const { jobId } = await searchParams;

  if (!jobId) {
    notFound();
  }

  const profile = await getEmployerCandidateProfile(candidateId, jobId);
  if (!profile) {
    notFound();
  }

  const { candidate } = profile;
  const initials = candidate.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
      <Link
        href={`/employer/jobs/${profile.jobId}/applicants`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#006e2f] hover:underline mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {profile.jobTitle}
      </Link>

      <header className="flex items-start gap-4 mb-8">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-emerald-50">
          {candidate.avatarUrl ? (
            <Image
              src={candidate.avatarUrl}
              alt={candidate.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-emerald-800">
              {initials}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 inline-flex items-center gap-2">
            {candidate.name}
            <VerifiedBadge show={candidate.isVerified} />
          </h1>
          <p className="text-sm text-slate-500 mt-1">{candidate.title}</p>
          {candidate.email ? (
            <p className="text-xs text-slate-400 mt-1">{candidate.email}</p>
          ) : null}
        </div>
      </header>

      {candidate.bio ? (
        <section className="mb-6 rounded-2xl border border-slate-100 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-2">About</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{candidate.bio}</p>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-100 bg-white p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-3">Skills</h2>
        {candidate.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No skills listed.</p>
        )}
        <p className="text-xs text-slate-400 mt-4">
          {candidate.experienceYears} years experience
        </p>
      </section>
    </div>
  );
}
