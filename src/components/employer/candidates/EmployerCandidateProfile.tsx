"use client";

import Link from "next/link";
import { AvatarImage } from "@/components/shared/media/AvatarImage";
import { ExternalLink, MapPin, Phone, Briefcase, Clock, Wallet } from "lucide-react";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { FeatureGate } from "@/components/shared/entitlements/FeatureGate";
import { UnlockOverlay } from "@/components/shared/entitlements/UnlockOverlay";
import { formatMoney, formatSalaryRange } from "@/lib/format/currency";
import { CandidateProfileActions } from "./CandidateProfileActions";
import {
  EmployerPageShell,
} from "@/components/employer/layout";

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
          {/* Header Card Upgrade */}
          <header className="relative bg-gradient-to-br from-emerald-50/20 via-white to-white border border-slate-100/90 shadow-xs sm:rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-[#ebfdf2] shadow-sm">
              <AvatarImage
                src={candidate.avatarUrl}
                alt={candidate.name}
                initials={initials}
                size="md"
                rounded="2xl"
              />
            </div>
            <div className="space-y-2 flex-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {candidate.name}
                <VerifiedBadge show={candidate.isVerified} />
              </h1>
              <p className={`text-sm sm:text-base ${isPreview ? "text-slate-500 font-medium" : "text-slate-600 font-semibold"}`}>
                {isPreview ? "Candidate Profile" : candidate.title}
              </p>
              {candidate.email ? (
                <p className="text-xs text-slate-400 mt-1 font-medium">{candidate.email}</p>
              ) : null}
            </div>
          </header>

          {/* Compensation & Availability Grouped Card */}
          {(salary || candidate.hourlyRate != null || candidate.availability) && (
            <section className="bg-white border border-slate-100/90 shadow-xs sm:rounded-2xl p-6 sm:p-8 space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-slate-500" />
                Compensation &amp; Availability
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100/60">
                {salary && (
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Expected Monthly Salary
                    </span>
                    <p className="text-lg font-extrabold text-[#006e2f]">{salary}</p>
                  </div>
                )}
                {candidate.hourlyRate != null && (
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Target Hourly Rate
                    </span>
                    <p className="text-lg font-extrabold text-[#006e2f]">
                      {isPreview ? (
                        <span className="blur-xs select-none">PHP 400 - 600/hr</span>
                      ) : (
                        formatMoney(candidate.hourlyRate, candidate.salaryCurrency, {
                          perHour: true,
                        })
                      )}
                    </p>
                  </div>
                )}
                {candidate.availability && (
                  <div className="space-y-1 sm:col-span-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Availability
                    </span>
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <Clock className="h-4 w-4 text-slate-400" />
                      {isPreview ? (
                        <span className="blur-xs select-none">Full-time (40 hrs/wk)</span>
                      ) : (
                        candidate.availability
                      )}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Skills & Experience Card */}
          <section className="bg-white border border-slate-100/90 shadow-xs sm:rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Skills &amp; Expertise
            </h2>
            <div className="pt-2 border-t border-slate-100/60">
              {detailedSkills ? (
                <div className="flex flex-wrap gap-2">
                  {detailedSkills.map((skill) => (
                    <span
                      key={skill.id ?? skill.skill_name}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 hover:border-slate-300"
                    >
                      {skill.skill_name}
                      {skill.proficiency_label ? (
                        <span className="text-slate-400 font-semibold"> · {skill.proficiency_label}</span>
                      ) : null}
                    </span>
                  ))}
                </div>
              ) : candidate.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 hover:border-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No skills listed.</p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-600">
              <Briefcase className="h-4 w-4 text-slate-400 shrink-0" aria-hidden />
              <span>
                <strong>{candidate.experienceYears} years</strong> of professional experience
              </span>
            </div>
          </section>

          {isPreview ? (
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-50/50 shadow-inner">
              {/* Restricted Content Wrapper (blurred & disabled) */}
              <div className="opacity-35 blur-[3px] select-none pointer-events-none space-y-6 p-6">
                {/* Restricted Section: Contact & Location */}
                <section className="bg-white border border-slate-100/90 shadow-xs sm:rounded-2xl p-6 space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
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
                <section className="bg-white border border-slate-100/90 shadow-xs sm:rounded-2xl p-6 space-y-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">About</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {candidate.bio || "Highly skilled professional with years of experience building modern web applications, implementing scalable database architectures, and leading agile dev teams to deliver high-quality code."}
                  </p>
                </section>

                {/* Restricted Section: Project highlights / Work history */}
                <section className="bg-white border border-slate-100/90 shadow-xs sm:rounded-2xl p-6 space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    Project highlights
                  </h2>
                  <ul className="space-y-4">
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
                  </ul>
                </section>
              </div>

              {/* Centered Paywall Upgrade Card Overlay */}
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/10 backdrop-blur-md p-6">
                <div className="w-full max-w-md mx-auto">
                  <UnlockOverlay 
                    feature="identity" 
                    currentPlan={planSlug}
                    className="shadow-2xl rounded-2xl border border-slate-100 bg-white/95 p-6 md:p-8"
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              {candidate.workerProjects.length > 0 && (
                <section className="bg-white border border-slate-100/90 shadow-xs sm:rounded-2xl p-6 sm:p-8 space-y-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Project highlights
                  </h2>
                  <ul className="divide-y divide-slate-100 pt-2">
                    {candidate.workerProjects.map((project, idx) => (
                      <li key={project.id ?? project.title} className={`py-4 space-y-2 ${idx === 0 ? "pt-0" : ""}`}>
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="text-base font-bold text-slate-900">
                            {project.title}
                          </h3>
                          {project.year ? (
                            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                              {project.year}
                            </span>
                          ) : null}
                        </div>
                        {project.role ? (
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {project.role}
                          </p>
                        ) : null}
                        {project.description ? (
                          <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            {project.description}
                          </p>
                        ) : null}
                        {project.skills_used && project.skills_used.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 pt-1.5">
                            {project.skills_used.map((sku) => (
                              <span key={sku} className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 rounded px-2 py-0.5">
                                {sku}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {(candidate.location ||
                candidate.phoneNumber ||
                candidate.portfolioUrl) && (
                <section className="bg-white border border-slate-100/90 shadow-xs sm:rounded-2xl p-6 sm:p-8 space-y-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Contact &amp; location
                  </h2>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-50 text-sm">
                    {candidate.location ? (
                      <div className="flex items-start gap-2 text-slate-600">
                        <MapPin
                          className="h-4.5 w-4.5 shrink-0 text-slate-400 mt-0.5"
                          aria-hidden
                        />
                        <div className="space-y-0.5">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Location</span>
                          <dd className="font-semibold text-slate-800">{candidate.location}</dd>
                        </div>
                      </div>
                    ) : null}
                    {candidate.phoneNumber ? (
                      <div className="flex items-start gap-2 text-slate-600">
                        <Phone
                          className="h-4.5 w-4.5 shrink-0 text-slate-400 mt-0.5"
                          aria-hidden
                        />
                        <div className="space-y-0.5">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Phone Number</span>
                          <dd>
                            <a
                              href={`tel:${candidate.phoneNumber}`}
                              className="font-semibold text-slate-800 hover:text-[#006e2f] transition-colors"
                            >
                              {candidate.phoneNumber}
                            </a>
                          </dd>
                        </div>
                      </div>
                    ) : null}
                    {candidate.portfolioUrl ? (
                      <div className="flex items-start gap-2 sm:col-span-2">
                        <ExternalLink
                          className="h-4.5 w-4.5 shrink-0 text-slate-400 mt-0.5"
                          aria-hidden
                        />
                        <div className="space-y-0.5">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Online Portfolio</span>
                          <dd>
                            <a
                              href={candidate.portfolioUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-[#006e2f] hover:underline flex items-center gap-1"
                            >
                              View portfolio
                            </a>
                          </dd>
                        </div>
                      </div>
                    ) : null}
                  </dl>
                </section>
              )}

              {candidate.bio ? (
                <section className="bg-white border border-slate-100/90 shadow-xs sm:rounded-2xl p-6 sm:p-8 space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">About Candidate</h2>
                  <p className="text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-50 font-medium">
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
