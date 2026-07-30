"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  finishEmployerOnboarding,
  saveEmployerOnboardingStep,
  type EmployerOnboardingDraft,
} from "@/actions/onboarding";
import { OnboardingWizardShell } from "@/components/shared/onboarding/OnboardingWizardShell";
import { SkillSelectDropdown } from "@/components/shared/SkillSelectDropdown";
import { CompanyLogoUpload } from "@/components/shared/CompanyLogoUpload";
import { companyLogoHelperText } from "@/lib/storage/profile-image";
import {
  COMPANY_SIZE_OPTIONS,
  ONBOARDING_SELECT_CLASS,
} from "@/config/onboarding";
import { EMPLOYER_INDUSTRIES } from "@/lib/data/industries";

const CONTENT_STEPS = 4;

type WizardPhase = "welcome" | "company" | "hiring" | "details" | "notification";

interface EmployerOnboardingWizardProps {
  draft: EmployerOnboardingDraft;
}

export function EmployerOnboardingWizard({ draft }: EmployerOnboardingWizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [phase, setPhase] = useState<WizardPhase>("welcome");

  const [companyName, setCompanyName] = useState(draft.companyName);
  const [industry, setIndustry] = useState(draft.industry);
  const [industryCustom, setIndustryCustom] = useState(draft.industryCustom ?? "");
  const [companySize, setCompanySize] = useState(draft.companySize);
  const [skills, setSkills] = useState<string[]>(draft.skills);
  const [websiteUrl, setWebsiteUrl] = useState(draft.websiteUrl);
  const [companyBio, setCompanyBio] = useState(draft.companyBio);
  const [logoUrl, setLogoUrl] = useState<string | null>(draft.logoUrl);
  const [notificationPreference, setNotificationPreference] = useState<string>(
    draft.notificationPreference ?? "email_every_applicant"
  );

  const stepIndex: Record<WizardPhase, number> = {
    welcome: 0,
    company: 1,
    hiring: 2,
    details: 3,
    notification: 4,
  };

  const finish = async () => {
    const result = await finishEmployerOnboarding();
    if (!result.success) {
      toast.error(result.error);
      return false;
    }
    toast.success("Company profile created!");
    router.replace("/employer/dashboard?onboarded=1");
    router.refresh();
    return true;
  };

  if (phase === "welcome") {
    return (
      <section className="mx-auto flex w-full max-w-lg flex-col gap-6 rounded-2xl border border-slate-100 bg-white px-4 py-8 shadow-sm sm:gap-7 sm:px-6 sm:py-12 md:gap-8 md:px-8 md:py-16 lg:py-20">
        <header className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#006e2f]">
            Employer onboarding
          </p>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl whitespace-normal break-words">
            Tell us about your company
          </h2>
          <p className="text-xs font-medium text-slate-600 sm:text-sm whitespace-normal break-words">
            Workers see this when you post jobs and review applicants. Takes
            about 2 minutes.
          </p>
        </header>
        <button
          type="button"
          onClick={() => setPhase("company")}
          className="w-full rounded-xl bg-[#006e2f] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#005c26]"
        >
          Get started
        </button>
      </section>
    );
  }

  const shellProps = {
    currentStep: stepIndex[phase],
    totalSteps: CONTENT_STEPS,
    isPending,
    accentClass: "bg-[#006e2f] hover:bg-[#005c26]",
  };

  if (phase === "company") {
    return (
      <OnboardingWizardShell
        {...shellProps}
        stepLabel="Company"
        title="Company basics"
        description="Your company name and industry appear on every job post."
        onBack={() => setPhase("welcome")}
        isNextDisabled={!companyName.trim() || !industry || !companySize || (industry === "Other" && !industryCustom.trim())}
        onNext={() => {
          startTransition(async () => {
            const result = await saveEmployerOnboardingStep("company", {
              companyName: companyName.trim(),
              industry,
              companySize,
              industryCustom: industry === "Other" ? industryCustom.trim() : undefined,
            });
            if (!result.success) {
              toast.error(result.error);
              return;
            }
            setPhase("hiring");
          });
        }}
      >
        <CompanyLogoUpload
          logoUrl={logoUrl}
          companyName={companyName}
          size="md"
          onLogoChange={setLogoUrl}
          helperText={`Optional. ${companyLogoHelperText()}`}
        />
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          Company name
          <input
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#006e2f]/30"
          />
        </label>
        <div className="space-y-2">
          <label
            htmlFor="onboarding-industry"
            className="block text-sm font-medium text-slate-700"
          >
            Industry
          </label>
          <select
            id="onboarding-industry"
            required
            value={industry}
            onChange={(e) => {
              const next = e.target.value;
              setIndustry(next);
              if (next !== "Other") setIndustryCustom("");
            }}
            className={ONBOARDING_SELECT_CLASS}
          >
            <option value="">Select industry</option>
            {industry &&
            !EMPLOYER_INDUSTRIES.some((item) => item.value === industry) ? (
              <option value={industry}>{industry}</option>
            ) : null}
            {EMPLOYER_INDUSTRIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        {industry === "Other" ? (
          <div className="space-y-2 rounded-xl border border-emerald-100 bg-[#ebfdf2]/60 p-4">
            <label
              htmlFor="onboarding-industry-custom"
              className="block text-sm font-medium text-slate-700"
            >
              Describe your industry
            </label>
            <input
              id="onboarding-industry-custom"
              required
              value={industryCustom}
              onChange={(e) => setIndustryCustom(e.target.value)}
              placeholder="e.g. Renewable Energy, Pet Care, Logistics"
              autoComplete="organization-title"
              className="w-full min-h-12 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006e2f]/30 sm:text-sm"
            />
            <p className="text-xs leading-relaxed text-slate-500">
              Workers see this on your company profile when you post jobs.
            </p>
          </div>
        ) : null}
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          Company size
          <select
            required
            value={companySize}
            onChange={(e) => setCompanySize(e.target.value)}
            className={ONBOARDING_SELECT_CLASS}
          >
            <option value="">Select company size</option>
            {COMPANY_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </OnboardingWizardShell>
    );
  }

  if (phase === "hiring") {
    return (
      <OnboardingWizardShell
        {...shellProps}
        stepLabel="Hiring focus"
        title="What do you hire for?"
        description="Select skills you most often need — we use these for matching."
        onBack={() => setPhase("company")}
        isNextDisabled={skills.length === 0}
        onNext={() => {
          startTransition(async () => {
            const result = await saveEmployerOnboardingStep("hiring", {
              skills,
            });
            if (!result.success) {
              toast.error(result.error);
              return;
            }
            setPhase("details");
          });
        }}
      >
        <SkillSelectDropdown
          label="Top skills you hire for"
          hint="Select up to 5 skills you most often need on your team"
          value={skills}
          onChange={setSkills}
          disabled={isPending}
        />
      </OnboardingWizardShell>
    );
  }

  if (phase === "details") {
    return (
      <OnboardingWizardShell
        {...shellProps}
        stepLabel="Details"
        title="Polish your company page"
        description="Optional links and bio — you can update these anytime in settings."
        onBack={() => setPhase("hiring")}
        canSkip
        nextLabel="Next"
        onSkip={() => {
          startTransition(async () => { setPhase("notification"); });
        }}
        onNext={() => {
          startTransition(async () => {
            const result = await saveEmployerOnboardingStep("details", {
              websiteUrl: websiteUrl.trim(),
              companyBio: companyBio.trim() || undefined,
            });
            if (!result.success) {
              toast.error(result.error);
              return;
            }
            setPhase("notification");
          });
        }}
      >
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          Website (optional)
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#006e2f]/30"
            placeholder="https://"
          />
        </label>
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          Company bio (optional)
          <textarea
            value={companyBio}
            onChange={(e) => setCompanyBio(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#006e2f]/30"
          />
        </label>
      </OnboardingWizardShell>
    );
  }

  if (phase === "notification") {
    const options = [
      {
        value: "email_every_applicant",
        label: "Email for every new applicant",
        description: "Get notified immediately when someone applies.",
      },
      {
        value: "email_daily_summary",
        label: "Daily email summary",
        description: "Receive a digest of all activity once per day.",
      },
      {
        value: "dashboard_only",
        label: "Manage through dashboard only",
        description: "No email notifications. Check your dashboard when ready.",
      },
    ];
    return (
      <OnboardingWizardShell
        {...shellProps}
        stepLabel="Notifications"
        title="How should we notify you?"
        description="Choose how you'd like to hear about new applicants. You can change this anytime."
        onBack={() => setPhase("details")}
        nextLabel="Finish"
        onNext={() => {
          startTransition(async () => {
            const result = await saveEmployerOnboardingStep("notification", {
              notificationPreference,
            });
            if (!result.success) {
              toast.error(result.error);
              return;
            }
            await finish();
          });
        }}
      >
        <div className="w-full min-w-0 space-y-4" role="radiogroup" aria-label="Applicant notification preference">
          {options.map((opt) => {
            const selected = notificationPreference === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setNotificationPreference(opt.value)}
                className={`btn-wrap flex w-full min-w-0 items-start gap-3 text-left rounded-xl border-2 p-4 transition-all sm:p-5 ${
                  selected
                    ? "border-[#006e2f] bg-[#ebfdf2]"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                    selected
                      ? "border-[#006e2f] bg-[#006e2f]"
                      : "border-slate-300 bg-white"
                  }`}
                  aria-hidden
                >
                  {selected ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  ) : null}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 break-words">
                    {opt.label}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500 break-words">
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </OnboardingWizardShell>
    );
  }

  return null;
}
