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

const CONTENT_STEPS = 4;

const INDUSTRIES = [
  "Technology",
  "E-commerce",
  "Healthcare",
  "Finance",
  "Education",
  "Other",
] as const;

type WizardPhase = "welcome" | "company" | "hiring" | "details" | "personal";

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

  // Employer Personal KYC State
  const [birthDate, setBirthDate] = useState(draft.birthDate || "");
  const [gender, setGender] = useState(draft.gender || "");
  const [civilStatus, setCivilStatus] = useState(draft.civilStatus || "");
  const [phoneNumber, setPhoneNumber] = useState(draft.phoneNumber || "");
  const [tinNumber, setTinNumber] = useState(draft.tinNumber || "");
  const [personalAddress, setPersonalAddress] = useState(draft.personalAddress || "");
  const [personalCity, setPersonalCity] = useState(draft.personalCity || "");
  const [personalStateProvince, setPersonalStateProvince] = useState(draft.personalStateProvince || "");
  const [country, setCountry] = useState(draft.country || "");

  const stepIndex: Record<WizardPhase, number> = {
    welcome: 0,
    company: 1,
    hiring: 2,
    details: 3,
    personal: 4,
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
      <section className="mx-auto w-full max-w-lg space-y-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6 md:p-8">
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

  if (phase === "details") {
    return (
      <OnboardingWizardShell
        {...shellProps}
        stepLabel="Details"
        title="Polish your company page"
        description="Optional links and bio — you can update these anytime in settings."
        onBack={() => setPhase("hiring")}
        canSkip
        onSkip={() => setPhase("personal")}
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
            setPhase("personal");
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

  const isPersonalNextDisabled =
    !birthDate ||
    !gender ||
    !civilStatus ||
    !phoneNumber.trim() ||
    !tinNumber.trim() ||
    !personalAddress.trim() ||
    !personalCity.trim() ||
    !personalStateProvince.trim() ||
    !country.trim();

  return (
    <OnboardingWizardShell
      {...shellProps}
      stepLabel="Personal details"
      title="Personal Details"
      description="Tell us about yourself to complete your employer profile."
      onBack={() => setPhase("details")}
      nextLabel="Finish"
      isNextDisabled={isPersonalNextDisabled}
      onNext={() => {
        startTransition(async () => {
          const result = await saveEmployerOnboardingStep("personal", {
            birthDate,
            gender,
            civilStatus,
            phoneNumber: phoneNumber.trim(),
            tinNumber: tinNumber.trim(),
            personalAddress: personalAddress.trim(),
            personalCity: personalCity.trim(),
            personalStateProvince: personalStateProvince.trim(),
            country: country.trim(),
          });
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          await finish();
        });
      }}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Birth Date
            <input
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#006e2f]/30"
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Gender
            <select
              required
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={ONBOARDING_SELECT_CLASS}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Civil Status
            <select
              required
              value={civilStatus}
              onChange={(e) => setCivilStatus(e.target.value)}
              className={ONBOARDING_SELECT_CLASS}
            >
              <option value="">Select Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Phone Number
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 234 567 8900"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#006e2f]/30"
            />
          </label>
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Personal Address (Manual Input)</h3>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Address Line
            <input
              type="text"
              required
              value={personalAddress}
              onChange={(e) => setPersonalAddress(e.target.value)}
              placeholder="e.g. 123 Main St, Apt 4B"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#006e2f]/30"
            />
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              City
              <input
                type="text"
                required
                value={personalCity}
                onChange={(e) => setPersonalCity(e.target.value)}
                placeholder="City"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#006e2f]/30"
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              State/Province
              <input
                type="text"
                required
                value={personalStateProvince}
                onChange={(e) => setPersonalStateProvince(e.target.value)}
                placeholder="State/Province"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#006e2f]/30"
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              Country
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#006e2f]/30"
              />
            </label>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Statutory Details</h3>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            TIN / EIN Number
            <input
              type="text"
              required
              value={tinNumber}
              onChange={(e) => setTinNumber(e.target.value)}
              placeholder="Tax ID Number"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#006e2f]/30"
            />
          </label>
        </div>
      </div>
    </OnboardingWizardShell>
  );
}
