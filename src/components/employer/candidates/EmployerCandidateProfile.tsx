"use client";

import Link from "next/link";
import Image from "next/image";
import { ExternalLink, MapPin, MessageSquare, Phone } from "lucide-react";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { FeatureGate } from "@/components/shared/entitlements/FeatureGate";
import { UnlockOverlay } from "@/components/shared/entitlements/UnlockOverlay";
import { UpgradeCTA } from "@/components/shared/entitlements/UpgradeCTA";
import { CandidateProfileActions } from "./CandidateProfileActions";
import {
  EmployerPageShell,
  EmployerStickyActionBar,
} from "@/components/employer/layout";
import { EMPLOYER_CARD } from "@/lib/employer/ui-tokens";

export type EmployerCandidateProfileData = {
  jobTitle: string;
  jobId: string;
  identityMode: "full" | "anonymous_preview";
  planSlug: string;
  resumeDownloadEnabled: boolean;
  messagingEnabled: boolean;
  isPinned: boolean;
  messagingThreadId?: string | null;
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
    cvUrl: string | null;
    location: string | null;
    phoneNumber: string | null;
    portfolioUrl: string | null;
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
  const {
    candidate,
    jobId,
    jobTitle,
    identityMode,
    planSlug,
    resumeDownloadEnabled,
    messagingEnabled,
    isPinned,
    messagingThreadId,
  } = profile;
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
    <EmployerPageShell width="content" className="gap-6 pb-24 lg:pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <FeatureGate
            allowed={!isPreview}
            feature="identity"
            currentPlan={planSlug}
            preview={
              <header className={`${EMPLOYER_CARD} flex items-start gap-4 p-5`}>
                <div className="h-16 w-16 rounded-2xl bg-slate-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-6 w-40 rounded bg-slate-200" />
                  <div className="h-4 w-28 rounded bg-slate-100" />
                  <div className="h-3 w-36 rounded bg-slate-100" />
                </div>
              </header>
            }
          >
            <header className={`${EMPLOYER_CARD} flex items-start gap-4 p-5`}>
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-[#ebfdf2]">
                {candidate.avatarUrl ? (
                  <Image
                    src={candidate.avatarUrl}
                    alt={candidate.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-bold text-[#006e2f]">
                    {initials}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 inline-flex items-center gap-2 flex-wrap">
                  {candidate.name}
                  <VerifiedBadge show={candidate.isVerified} />
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">
                  {candidate.title}
                </p>
                {candidate.email ? (
                  <p className="text-xs text-slate-400 mt-1">{candidate.email}</p>
                ) : null}
              </div>
            </header>
          </FeatureGate>

          {salary ? (
            <section className={`${EMPLOYER_CARD} p-5`}>
              <h2 className="text-sm font-bold text-slate-900 mb-1">
                Expected compensation
              </h2>
              <p className="text-sm font-semibold text-[#006e2f]">{salary}</p>
            </section>
          ) : null}

          <section className={`${EMPLOYER_CARD} p-5`}>
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
            <p className="text-xs text-slate-400 mt-4 font-medium">
              {candidate.experienceYears} years experience
            </p>
          </section>

          {isPreview ? (
            <UnlockOverlay feature="identity" currentPlan={planSlug} />
          ) : (
            <>
              {(candidate.location ||
                candidate.phoneNumber ||
                candidate.portfolioUrl) && (
                <section className={`${EMPLOYER_CARD} p-5`}>
                  <h2 className="text-sm font-bold text-slate-900 mb-3">
                    Contact &amp; location
                  </h2>
                  <dl className="space-y-2 text-sm">
                    {candidate.location ? (
                      <div className="flex items-start gap-2 text-slate-600">
                        <MapPin
                          className="h-4 w-4 shrink-0 text-slate-400 mt-0.5"
                          aria-hidden
                        />
                        <dd>{candidate.location}</dd>
                      </div>
                    ) : null}
                    {candidate.phoneNumber ? (
                      <div className="flex items-start gap-2 text-slate-600">
                        <Phone
                          className="h-4 w-4 shrink-0 text-slate-400 mt-0.5"
                          aria-hidden
                        />
                        <dd>
                          <a
                            href={`tel:${candidate.phoneNumber}`}
                            className="hover:text-[#006e2f] transition-colors"
                          >
                            {candidate.phoneNumber}
                          </a>
                        </dd>
                      </div>
                    ) : null}
                    {candidate.portfolioUrl ? (
                      <div className="flex items-start gap-2">
                        <ExternalLink
                          className="h-4 w-4 shrink-0 text-slate-400 mt-0.5"
                          aria-hidden
                        />
                        <dd>
                          <a
                            href={candidate.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#006e2f] font-semibold hover:underline"
                          >
                            View portfolio
                          </a>
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </section>
              )}

              {candidate.bio ? (
                <section className={`${EMPLOYER_CARD} p-5`}>
                  <h2 className="text-sm font-bold text-slate-900 mb-2">About</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {candidate.bio}
                  </p>
                </section>
              ) : null}
            </>
          )}
        </div>

        <aside>
          <CandidateProfileActions
            candidateId={candidate.id}
            jobId={jobId}
            planSlug={planSlug}
            messagingEnabled={messagingEnabled}
            messagingThreadId={messagingThreadId}
            resumeDownloadEnabled={resumeDownloadEnabled}
            resumeUrl={candidate.resumeUrl}
            cvUrl={candidate.cvUrl}
            isPreview={isPreview}
            isPinned={isPinned}
          />
        </aside>
      </div>

      {isPreview ? (
        <EmployerStickyActionBar>
          <UpgradeCTA
            feature="identity"
            currentPlan={planSlug}
            className="w-full justify-center"
          />
        </EmployerStickyActionBar>
      ) : null}
    </EmployerPageShell>
  );
}
