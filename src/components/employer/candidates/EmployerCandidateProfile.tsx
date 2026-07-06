"use client";

import Link from "next/link";
import { AvatarImage } from "@/components/shared/media/AvatarImage";
import { ExternalLink, MapPin, MessageSquare, Phone } from "lucide-react";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { FeatureGate } from "@/components/shared/entitlements/FeatureGate";
import { UnlockOverlay } from "@/components/shared/entitlements/UnlockOverlay";
import { UpgradeCTA } from "@/components/shared/entitlements/UpgradeCTA";
import { formatMoney, formatSalaryRange } from "@/lib/format/currency";
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
    workerSkills: Array<{
      id?: string;
      skill_name?: string;
      proficiency_label?: string;
    }>;
    workerProjects: Array<{
      id?: string;
      title?: string;
      role?: string;
      year?: number;
      description?: string;
      skills_used?: string[];
    }>;
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
    hourlyRate: number | null;
    availability: string | null;
  };
};

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
  const detailedSkills =
    candidate.workerSkills.length > 0 ? candidate.workerSkills : null;

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
          <header className={`${EMPLOYER_CARD} flex items-start gap-4 p-5`}>
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-[#ebfdf2]">
              <AvatarImage
                src={candidate.avatarUrl}
                alt={candidate.name}
                initials={initials}
                size="sm"
                rounded="2xl"
              />
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

          {salary ? (
            <section className={`${EMPLOYER_CARD} p-5`}>
              <h2 className="text-sm font-bold text-slate-900 mb-1">
                Expected compensation
              </h2>
              <p className="text-sm font-semibold text-[#006e2f]">{salary}</p>
            </section>
          ) : null}

          {!isPreview && candidate.hourlyRate != null ? (
            <section className={`${EMPLOYER_CARD} p-5`}>
              <h2 className="text-sm font-bold text-slate-900 mb-1">
                Hourly rate
              </h2>
              <p className="text-sm font-semibold text-[#006e2f]">
                {formatMoney(candidate.hourlyRate, candidate.salaryCurrency, {
                  perHour: true,
                })}
              </p>
              {candidate.availability ? (
                <p className="text-xs text-slate-500 mt-1">
                  Availability: {candidate.availability}
                </p>
              ) : null}
            </section>
          ) : null}

          <section className={`${EMPLOYER_CARD} p-5`}>
            <h2 className="text-sm font-bold text-slate-900 mb-3">Skills</h2>
            {detailedSkills ? (
              <div className="flex flex-wrap gap-2">
                {detailedSkills.map((skill) => (
                  <span
                    key={skill.id ?? skill.skill_name}
                    className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
                  >
                    {skill.skill_name}
                    {skill.proficiency_label
                      ? ` · ${skill.proficiency_label}`
                      : ""}
                  </span>
                ))}
              </div>
            ) : candidate.skills.length > 0 ? (
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
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50">
              {/* Restricted Content Wrapper (blurred & disabled) */}
              <div className="opacity-40 blur-[2px] select-none pointer-events-none space-y-6 p-6">
                {/* Restricted Section: Contact & Location */}
                <section className={`${EMPLOYER_CARD} p-5 bg-white`}>
                  <h2 className="text-sm font-bold text-slate-900 mb-3">
                    Contact &amp; location
                  </h2>
                  <dl className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <dd>{candidate.location || "Manila, Philippines"}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <dd>{candidate.phoneNumber || "+63 917 123 4567"}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-slate-400" />
                      <dd>candidate-portfolio-link.com</dd>
                    </div>
                  </dl>
                </section>

                {/* Restricted Section: About / Bio */}
                <section className={`${EMPLOYER_CARD} p-5 bg-white`}>
                  <h2 className="text-sm font-bold text-slate-900 mb-2">About</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {candidate.bio || "Highly skilled professional with years of experience building modern web applications, implementing scalable database architectures, and leading agile dev teams to deliver high-quality code."}
                  </p>
                </section>

                {/* Restricted Section: Project highlights / Work history */}
                <section className={`${EMPLOYER_CARD} p-5 bg-white`}>
                  <h2 className="text-sm font-bold text-slate-900 mb-3">
                    Project highlights
                  </h2>
                  <ul className="space-y-4">
                    {candidate.workerProjects.length > 0 ? (
                      candidate.workerProjects.map((project) => (
                        <li key={project.id ?? project.title} className="space-y-1">
                          <p className="text-sm font-bold text-slate-900">
                            {project.title}
                            {project.year ? (
                              <span className="font-medium text-slate-400">
                                {" "}
                                · {project.year}
                              </span>
                            ) : null}
                          </p>
                          {project.role ? (
                            <p className="text-xs font-semibold text-slate-500">
                              {project.role}
                            </p>
                          ) : null}
                          {project.description ? (
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {project.description}
                            </p>
                          ) : null}
                        </li>
                      ))
                    ) : (
                      <li className="space-y-1">
                        <p className="text-sm font-bold text-slate-900">
                          Senior Full-Stack Developer
                          <span className="font-medium text-slate-400"> · 2024</span>
                        </p>
                        <p className="text-xs font-semibold text-slate-500">
                          E-Commerce Platform Redesign
                        </p>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          Led development of a high-performance web storefront, optimizing image loading and page speed.
                        </p>
                      </li>
                    )}
                  </ul>
                </section>
              </div>

              {/* Centered Paywall Upgrade Card Overlay */}
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm p-4">
                <div className="w-full max-w-md mx-auto">
                  <UnlockOverlay 
                    feature="identity" 
                    currentPlan={planSlug}
                    className="shadow-xl rounded-xl border border-gray-200 bg-white"
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              {candidate.workerProjects.length > 0 && (
                <section className={`${EMPLOYER_CARD} p-5`}>
                  <h2 className="text-sm font-bold text-slate-900 mb-3">
                    Project highlights
                  </h2>
                  <ul className="space-y-4">
                    {candidate.workerProjects.map((project) => (
                      <li key={project.id ?? project.title} className="space-y-1">
                        <p className="text-sm font-bold text-slate-900">
                          {project.title}
                          {project.year ? (
                            <span className="font-medium text-slate-400">
                              {" "}
                              · {project.year}
                            </span>
                          ) : null}
                        </p>
                        {project.role ? (
                          <p className="text-xs font-semibold text-slate-500">
                            {project.role}
                          </p>
                        ) : null}
                        {project.description ? (
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {project.description}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

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
    </EmployerPageShell>
  );
}
