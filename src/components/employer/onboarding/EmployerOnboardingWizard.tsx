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
import { SkillPicker } from "@/components/shared/onboarding/SkillPicker";
import { CompanyLogoUpload } from "@/components/shared/CompanyLogoUpload";
import { companyLogoHelperText } from "@/lib/storage/profile-image";
import {
  COMPANY_SIZE_OPTIONS,
  DEFAULT_SKILL_OPTIONS,
  ONBOARDING_SELECT_CLASS,
} from "@/config/onboarding";

const CONTENT_STEPS = 3;

const INDUSTRIES = [
  "Technology",
  "E-commerce",
  "Healthcare",
  "Finance",
  "Education",
  "Other",
] as const;

type WizardPhase = "welcome" | "company" | "hiring" | "details";

interface EmployerOnboardingWizardProps {
  draft: EmployerOnboardingDraft;
}

export function EmployerOnboardingWizard({ draft }: EmployerOnboardingWizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [phase, setPhase] = useState<WizardPhase>("welcome");

  const [companyName, setCompanyName] = useState(draft.companyName);
  const [industry, setIndustry] = useState(draft.industry);
  const [companySize, setCompanySize] = useState(draft.companySize);
  const [skills, setSkills] = useState<string[]>(draft.skills);
  const [websiteUrl, setWebsiteUrl] = useState(draft.websiteUrl);
  const [companyBio, setCompanyBio] = useState(draft.companyBio);
  const [logoUrl, setLogoUrl] = useState<string | null>(draft.logoUrl);

  const stepIndex: Record<WizardPhase, number> = {
    welcome: 0,
    company: 1,
    hiring: 2,
    details: 3,
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
      <section className="mx-auto w-full max-w-lg space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <header className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#006e2f]">
            Employer onboarding
          </p>
          <h2 className="text-2xl font-bold text-slate-900">
            Tell us about your company
          </h2>
          <p className="text-sm font-medium text-slate-600">
            Workers see this when you post jobs and review applicants. Takes
            about 2 minutes.
          </p>
        </header>
        <button
          type="button"
          onClick={() => setPhase("company")}
          className="w-full rounded-xl bg-[#006e2f] py-3 text-sm font-bold text-white transition-colors hover:bg-[#005c26]"
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
        isNextDisabled={!companyName.trim() || !industry || !companySize}
        onNext={() => {
          startTransition(async () => {
            const result = await saveEmployerOnboardingStep("company", {
              companyName: companyName.trim(),
              industry,
              companySize,
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
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          Industry
          <select
            required
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className={ONBOARDING_SELECT_CLASS}
          >
            <option value="">Select industry</option>
            {INDUSTRIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
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
        <SkillPicker
          label="Top skills you hire for"
          hint="Select or add the skills you most often need on your team."
          options={DEFAULT_SKILL_OPTIONS}
          value={skills}
          onChange={setSkills}
          maxSkills={8}
          disabled={isPending}
        />
      </OnboardingWizardShell>
    );
  }

  return (
    <OnboardingWizardShell
      {...shellProps}
      stepLabel="Details"
      title="Polish your company page"
      description="Optional links and bio — you can update these anytime in settings."
      onBack={() => setPhase("hiring")}
      canSkip
      nextLabel="Go to dashboard"
      onSkip={() => {
        startTransition(async () => {
          await finish();
        });
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
          await finish();
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
