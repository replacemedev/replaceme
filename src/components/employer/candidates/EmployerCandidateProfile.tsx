"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, FileDown, MessageSquare } from "lucide-react";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { FeatureGate } from "@/components/shared/entitlements/FeatureGate";
import { UnlockOverlay } from "@/components/shared/entitlements/UnlockOverlay";
import { UpgradeCTA } from "@/components/shared/entitlements/UpgradeCTA";

export type EmployerCandidateProfileData = {
  jobTitle: string;
  jobId: string;
  identityMode: "full" | "anonymous_preview";
  planSlug: string;
  resumeDownloadEnabled: boolean;
  candidate: {
    id: string;
    name: string;
    title: string;
    bio: string | null;
    skills: string[];
    experienceYears: number;
    avatarUrl: string | null;
    email: string | null;
    isVerified: boolean;
    resumeUrl: string | null;
    expectedSalaryMin: number | null;
    expectedSalaryMax: number | null;
    salaryCurrency: string;
  };
};

function formatSalaryRange(
  min: number | null,
  max: number | null,
  currency: string
): string | null {
  if (min === null && max === null) return null;
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  if (min !== null && max !== null) return `${fmt(min)} – ${fmt(max)}`;
  if (min !== null) return `From ${fmt(min)}`;
  if (max !== null) return `Up to ${fmt(max)}`;
  return null;
}

export function EmployerCandidateProfile({
  profile,
}: {
  profile: EmployerCandidateProfileData;
}) {
  const { candidate, jobId, jobTitle, identityMode, planSlug, resumeDownloadEnabled } =
    profile;
  const isPreview = identityMode === "anonymous_preview";
  const salary = formatSalaryRange(
    candidate.expectedSalaryMin,
    candidate.expectedSalaryMax,
    candidate.salaryCurrency
  );

  const initials = candidate.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
      <Link
        href={`/employer/jobs/${jobId}/applicants`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#006e2f] hover:underline mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {jobTitle}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <FeatureGate
            allowed={!isPreview}
            feature="identity"
            currentPlan={planSlug}
            preview={
              <header className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5">
                <div className="h-16 w-16 rounded-2xl bg-emerald-100" />
                <div className="space-y-2 flex-1">
                  <div className="h-6 w-40 rounded bg-slate-200" />
                  <div className="h-4 w-28 rounded bg-slate-100" />
                  <div className="h-3 w-36 rounded bg-slate-100" />
                </div>
              </header>
            }
          >
            <header className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5">
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
          </FeatureGate>

          {salary ? (
            <section className="rounded-2xl border border-slate-100 bg-white p-5">
              <h2 className="text-sm font-bold text-slate-900 mb-1">
                Expected compensation
              </h2>
              <p className="text-sm font-semibold text-[#006e2f]">{salary}</p>
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

          {isPreview ? (
            <UnlockOverlay feature="identity" currentPlan={planSlug} />
          ) : candidate.bio ? (
            <section className="rounded-2xl border border-slate-100 bg-white p-5">
              <h2 className="text-sm font-bold text-slate-900 mb-2">About</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{candidate.bio}</p>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          {isPreview ? (
            <div className="hidden lg:block">
              <UnlockOverlay feature="identity" currentPlan={planSlug} />
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-3">
              <h2 className="text-sm font-bold text-slate-900">Actions</h2>
              <Link
                href={`/employer/messages?candidateId=${candidate.id}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#006e2f] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#005c26]"
              >
                <MessageSquare className="h-4 w-4" />
                Message candidate
              </Link>
              {resumeDownloadEnabled && candidate.resumeUrl ? (
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <FileDown className="h-4 w-4" />
                  Download resume
                </a>
              ) : !resumeDownloadEnabled ? (
                <UnlockOverlay
                  feature="resume"
                  currentPlan={planSlug}
                  compact
                />
              ) : null}
            </div>
          )}
        </aside>
      </div>

      {isPreview ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 p-4 backdrop-blur-md lg:hidden">
          <UpgradeCTA
            feature="identity"
            currentPlan={planSlug}
            className="w-full justify-center"
          />
        </div>
      ) : null}
    </div>
  );
}
