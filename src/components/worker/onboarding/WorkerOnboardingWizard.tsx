"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";
import { showErrorToast } from "@/utils/toast";
import { usePhilippineLocations } from "@/hooks/usePhilippineLocations";
import {
  finishWorkerOnboarding,
  saveWorkerOnboardingStep,
  type WorkerOnboardingDraft,
} from "@/actions/onboarding";
import { OnboardingWizardShell } from "@/components/shared/onboarding/OnboardingWizardShell";
import { ProfileAvatarUpload } from "@/components/shared/ProfileAvatarUpload";
import { profileImageHelperText } from "@/lib/storage/profile-image";
import { SkillSelectDropdown } from "@/components/shared/SkillSelectDropdown";
import {
  ONBOARDING_SELECT_CLASS,
} from "@/config/onboarding";
import { COMPENSATION_CURRENCIES } from "@/lib/format/currency";
import { formatFullName } from "@/lib/format/name";

const CONTENT_STEPS = 6;
const AVAILABILITY_OPTIONS = [
  "Full-time",
  "Part-time",
  "Contract",
  "Not available",
] as const;

const RATE_NOTE =
  "Note: Please set a reasonable rate expectation to improve your chances of receiving job offers.";

const SKILLS_HELPER =
  "Pick at least one. This will help us find you the perfect role.";

type WizardPhase =
  | "welcome"
  | "identity"
  | "location"
  | "skills"
  | "compensation"
  | "about"
  | "experience";

interface WorkerOnboardingWizardProps {
  draft: WorkerOnboardingDraft;
}

function parseLanguageChips(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function SpokenLanguagesInput({
  value,
  onChange,
  disabled,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState("");

  function commit(raw: string) {
    const parts = parseLanguageChips(raw);
    if (parts.length === 0) return;
    const merged = Array.from(new Set([...value, ...parts])).slice(0, 8);
    onChange(merged);
    setDraft("");
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        Spoken Languages
      </label>
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map((lang) => (
            <span
              key={lang}
              className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-[#ebfdf2] px-2.5 py-1 text-xs font-semibold text-[#006e2f]"
            >
              {lang}
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(value.filter((l) => l !== lang))}
                className="rounded-full p-0.5 hover:bg-emerald-100"
                aria-label={`Remove ${lang}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <input
        type="text"
        value={draft}
        disabled={disabled || value.length >= 8}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit(draft);
          }
        }}
        onBlur={() => {
          if (draft.trim()) commit(draft);
        }}
        placeholder="e.g. English, Tagalog — press Enter"
        className="w-full rounded-xl border border-slate-200 px-4 py-3"
      />
      <p className="text-xs text-slate-500">
        Add up to 8 languages. Separate with commas or press Enter.
      </p>
    </div>
  );
}

export function WorkerOnboardingWizard({ draft }: WorkerOnboardingWizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { isLoading: isLocationsLoading, regions, getProvincesForRegion, getCitiesForProvince } = usePhilippineLocations();
  const [phase, setPhase] = useState<WizardPhase>("welcome");

  const [professionalTitle, setProfessionalTitle] = useState(
    draft.professionalTitle
  );
  const firstName = draft.firstName;
  const middleName = draft.middleName;
  const lastName = draft.lastName;
  const suffix = draft.suffix;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(draft.avatarUrl);
  const [gender, setGender] = useState(draft.gender || "");
  const [spokenLanguages, setSpokenLanguages] = useState<string[]>(
    draft.spokenLanguages ?? []
  );
  const [middleNameDraft, setMiddleNameDraft] = useState(middleName || "");
  const [suffixDraft, setSuffixDraft] = useState(suffix || "");
  const [region, setRegion] = useState(draft.region || "");
  const [province, setProvince] = useState(draft.province || "");
  const [city, setCity] = useState(draft.city || "");
  const [addressLine1, setAddressLine1] = useState(draft.addressLine1 || "");
  const [availability, setAvailability] = useState(draft.availability);
  const [skills, setSkills] = useState<string[]>(draft.skills);
  const [hourlyRate, setHourlyRate] = useState(
    draft.hourlyRate != null ? String(draft.hourlyRate) : ""
  );
  const [salaryCurrency, setSalaryCurrency] = useState(draft.salaryCurrency);
  const [expectedSalaryMin, setExpectedSalaryMin] = useState(
    draft.expectedSalaryMin != null ? String(draft.expectedSalaryMin) : ""
  );
  const [expectedSalaryMax, setExpectedSalaryMax] = useState(
    draft.expectedSalaryMax != null ? String(draft.expectedSalaryMax) : ""
  );
  const [bio, setBio] = useState(draft.bio);
  const [birthDate, setBirthDate] = useState(draft.birthDate ?? "");
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [experienceDescription, setExperienceDescription] = useState("");
  const [experienceSkills, setExperienceSkills] = useState<string[]>([]);

  const stepIndex: Record<WizardPhase, number> = {
    welcome: 0,
    identity: 1,
    location: 2,
    skills: 3,
    compensation: 4,
    about: 5,
    experience: 6,
  };

  const goNext = (next: WizardPhase) => setPhase(next);
  const goBack = (prev: WizardPhase) => setPhase(prev);

  if (phase === "welcome") {
    return (
      <section className="mx-auto flex w-full max-w-lg flex-col gap-5 rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:gap-6 sm:px-8 sm:py-8">
        <header className="space-y-2 text-center sm:text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            Worker onboarding
          </p>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-3xl whitespace-normal break-words">
            Build a profile employers trust
          </h1>
          <p className="text-xs font-medium text-slate-600 sm:text-sm whitespace-normal break-words">
            A short guided setup about 3 minutes. You can skip optional steps
            and finish later from your profile.
          </p>
        </header>
        <button
          type="button"
          onClick={() => goNext("identity")}
          className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90"
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
  };

  if (phase === "identity") {
    const isIdentityNextDisabled =
      !avatarUrl ||
      !professionalTitle.trim() ||
      !firstName.trim() ||
      !lastName.trim() ||
      !gender ||
      spokenLanguages.length === 0;

    return (
      <OnboardingWizardShell
        {...shellProps}
        stepLabel="Role & identity"
        title="How should employers know you?"
        description="Your name and title appear on applications and your public profile."
        onBack={() => goBack("welcome")}
        isNextDisabled={isIdentityNextDisabled}
        onNext={() => {
          startTransition(async () => {
            const result = await saveWorkerOnboardingStep("identity", {
              professionalTitle: professionalTitle.trim(),
              firstName: firstName.trim(),
              middleName: middleNameDraft.trim() || null,
              lastName: lastName.trim(),
              suffix: suffixDraft.trim() || null,
              gender,
              spokenLanguages,
            });
            if (!result.success) {
              showErrorToast(result.error);
              return;
            }
            goNext("location");
          });
        }}
      >
        <ProfileAvatarUpload
          avatarUrl={avatarUrl}
          displayName={
            formatFullName(firstName, middleNameDraft, lastName, suffixDraft) ||
            professionalTitle.trim() ||
            "Worker"
          }
          size="md"
          onAvatarChange={setAvatarUrl}
          helperText={profileImageHelperText()}
        />
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          Professional title
          <input
            required
            value={professionalTitle}
            onChange={(e) => setProfessionalTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
            placeholder="e.g., Senior Video Editor"
          />
        </label>
        <div className="space-y-6 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Legal name
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block min-w-0 space-y-2 text-sm font-medium text-slate-700">
              First name
              <input
                required
                readOnly
                value={firstName}
                className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 opacity-80 cursor-not-allowed focus:ring-0"
              />
            </label>
            <label className="block min-w-0 space-y-2 text-sm font-medium text-slate-700">
              Middle name
              <span className="ml-1 text-xs font-normal text-slate-400">(optional)</span>
              <input
                value={middleNameDraft}
                onChange={(e) => setMiddleNameDraft(e.target.value)}
                placeholder="Legal middle name"
                autoComplete="additional-name"
                className="w-full min-w-0 rounded-xl border border-slate-200 px-4 py-3 break-words"
              />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block min-w-0 space-y-2 text-sm font-medium text-slate-700">
              Last name
              <input
                required
                readOnly
                value={lastName}
                className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 opacity-80 cursor-not-allowed focus:ring-0"
              />
            </label>
            <label className="block min-w-0 space-y-2 text-sm font-medium text-slate-700">
              Suffix
              <span className="ml-1 text-xs font-normal text-slate-400">(optional)</span>
              <input
                value={suffixDraft}
                onChange={(e) => setSuffixDraft(e.target.value)}
                placeholder="Jr., III, PhD"
                autoComplete="honorific-suffix"
                className="w-full min-w-0 rounded-xl border border-slate-200 px-4 py-3 break-words"
              />
            </label>
          </div>
        </div>

        <SpokenLanguagesInput
          value={spokenLanguages}
          onChange={setSpokenLanguages}
          disabled={isPending}
        />

        <label className="block space-y-2 text-sm font-medium text-slate-700">
          Gender
          <select
            required
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </label>
      </OnboardingWizardShell>
    );
  }

  if (phase === "location") {
    return (
      <OnboardingWizardShell
        {...shellProps}
        stepLabel="Location & availability"
        title="Where are you based?"
        description="Helps employers match you with remote-friendly roles."
        onBack={() => goBack("identity")}
        isNextDisabled={!region || !province || !city}
        onNext={() => {
          startTransition(async () => {
            const result = await saveWorkerOnboardingStep("location", {
              region,
              province,
              city,
              addressLine1: addressLine1.trim() || undefined,
              availability,
            });
            if (!result.success) {
              showErrorToast(result.error);
              return;
            }
            goNext("skills");
          });
        }}
      >
        <div className="space-y-6">
          {isLocationsLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium py-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />
              Loading Philippine location data...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                Region *
                <select
                  value={region}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRegion(val);
                    setProvince("");
                    setCity("");
                  }}
                  className={ONBOARDING_SELECT_CLASS}
                >
                  <option value="">Select Region</option>
                  {regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2 text-sm font-medium text-slate-700">
                Province *
                <select
                  value={province}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProvince(val);
                    setCity("");
                  }}
                  disabled={!region}
                  className={ONBOARDING_SELECT_CLASS}
                >
                  <option value="">Select Province</option>
                  {getProvincesForRegion(region).map((p) => (
                    <option key={p.key} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2 text-sm font-medium text-slate-700">
                City / Municipality *
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!province}
                  className={ONBOARDING_SELECT_CLASS}
                >
                  <option value="">Select City / Municipality</option>
                  {getCitiesForProvince(province).map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2 text-sm font-medium text-slate-700 col-span-full">
                Address Line 1 (Optional)
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="e.g. House No., Street, Barangay"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </label>
            </div>
          )}

          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Availability
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className={ONBOARDING_SELECT_CLASS}
            >
              {AVAILABILITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </OnboardingWizardShell>
    );
  }

  if (phase === "skills") {
    return (
      <OnboardingWizardShell
        {...shellProps}
        stepLabel="Top skills"
        title="What are your strongest skills?"
        description={SKILLS_HELPER}
        onBack={() => goBack("location")}
        isNextDisabled={skills.length < 3 || skills.length > 6}
        onNext={() => {
          startTransition(async () => {
            const result = await saveWorkerOnboardingStep("skills", { skills });
            if (!result.success) {
              showErrorToast(result.error);
              return;
            }
            goNext("compensation");
          });
        }}
      >
        <SkillSelectDropdown
          label="Top skills"
          hint="Select 3–6 skills to continue."
          value={skills}
          onChange={setSkills}
          disabled={isPending}
          maxSkills={6}
        />
        <p className="text-xs font-semibold text-slate-500">
          {skills.length}/6 selected · need 3–6 for a strong match profile.
        </p>
      </OnboardingWizardShell>
    );
  }

  if (phase === "compensation") {
    return (
      <OnboardingWizardShell
        {...shellProps}
        stepLabel="Compensation"
        title="Set your rate expectations"
        description="Optional: helps employers filter for budget fit. Billing stays in USD on paid plans."
        onBack={() => goBack("skills")}
        canSkip
        onSkip={() => goNext("about")}
        onNext={() => {
          startTransition(async () => {
            const result = await saveWorkerOnboardingStep("compensation", {
              hourlyRate: hourlyRate.trim() ? Number(hourlyRate) : null,
              salaryCurrency,
              expectedSalaryMin: expectedSalaryMin.trim()
                ? Number(expectedSalaryMin)
                : null,
              expectedSalaryMax: expectedSalaryMax.trim()
                ? Number(expectedSalaryMax)
                : null,
            });
            if (!result.success) {
              showErrorToast(result.error);
              return;
            }
            goNext("about");
          });
        }}
      >
        <p className="rounded-xl border border-emerald-100 bg-[#ebfdf2]/60 px-4 py-3 text-xs font-medium leading-relaxed text-slate-700">
          {RATE_NOTE}
        </p>
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          Currency
          <select
            value={salaryCurrency}
            onChange={(e) => setSalaryCurrency(e.target.value)}
            className={ONBOARDING_SELECT_CLASS}
          >
            {COMPENSATION_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          Hourly rate (optional)
          <input
            type="number"
            min={0}
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
            placeholder="e.g. 25"
          />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Expected salary min / mo
            <input
              type="number"
              min={0}
              value={expectedSalaryMin}
              onChange={(e) => setExpectedSalaryMin(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Expected salary max / mo
            <input
              type="number"
              min={0}
              value={expectedSalaryMax}
              onChange={(e) => setExpectedSalaryMax(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
        </div>
      </OnboardingWizardShell>
    );
  }

  if (phase === "about") {
    return (
      <OnboardingWizardShell
        {...shellProps}
        stepLabel="Your story"
        title="Tell Employers Your Story"
        description="Share a short bio and your date of birth so employers can get to know you."
        onBack={() => goBack("compensation")}
        isNextDisabled={!birthDate.trim()}
        onNext={() => {
          startTransition(async () => {
            const result = await saveWorkerOnboardingStep("about", {
              bio: bio.trim() || undefined,
              birthDate: birthDate.trim(),
            });
            if (!result.success) {
              showErrorToast(result.error);
              return;
            }
            goNext("experience");
          });
        }}
      >
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          Short bio
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
            placeholder="What you do, years of experience, industries…"
          />
        </label>
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          Date of birth
          <input
            type="date"
            required
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </label>
      </OnboardingWizardShell>
    );
  }

  const hasExperienceDraft =
    companyName.trim() ||
    roleTitle.trim() ||
    startDate.trim() ||
    endDate.trim() ||
    experienceDescription.trim() ||
    experienceSkills.length > 0;

  const experienceIncomplete =
    Boolean(hasExperienceDraft) &&
    (!companyName.trim() ||
      !roleTitle.trim() ||
      !startDate.trim() ||
      !experienceDescription.trim());

  async function finishOnboarding() {
    const result = await finishWorkerOnboarding();
    if (!result.success) {
      showErrorToast(result.error);
      return;
    }
    toast.success("Profile ready!");
    router.replace("/worker/dashboard");
    router.refresh();
  }

  return (
    <OnboardingWizardShell
      {...shellProps}
      stepLabel="Job experience"
      title="Add recent work experience"
      description="Optional: share a role you've held. You can add more from your profile later."
      onBack={() => goBack("about")}
      canSkip
      onSkip={() => {
        startTransition(async () => {
          await finishOnboarding();
        });
      }}
      nextLabel="Finish"
      isNextDisabled={experienceIncomplete}
      onNext={() => {
        startTransition(async () => {
          if (hasExperienceDraft) {
            const result = await saveWorkerOnboardingStep("experience", {
              companyName: companyName.trim(),
              roleTitle: roleTitle.trim(),
              startDate: startDate.trim(),
              endDate: endDate.trim() ? endDate.trim() : null,
              description: experienceDescription.trim(),
              skillsUsed: experienceSkills,
            });
            if (!result.success) {
              showErrorToast(result.error);
              return;
            }
          }
          await finishOnboarding();
        });
      }}
    >
      <label className="block space-y-2 text-sm font-medium text-slate-700">
        Company name
        <input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
          placeholder="e.g. Acme Studio"
        />
      </label>
      <label className="block space-y-2 text-sm font-medium text-slate-700">
        Role title
        <input
          value={roleTitle}
          onChange={(e) => setRoleTitle(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
          placeholder="e.g., Senior Video Editor"
        />
      </label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          Start date
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
        </label>
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          End date
          <span className="ml-1 text-xs font-normal text-slate-400">(optional)</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
        </label>
      </div>
      <label className="block space-y-2 text-sm font-medium text-slate-700">
        Description
        <textarea
          value={experienceDescription}
          onChange={(e) => setExperienceDescription(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
          placeholder="What you owned, outcomes, tools…"
        />
      </label>
      <SkillSelectDropdown
        label="Skills used"
        hint="Optional — technologies or skills from this role"
        value={experienceSkills}
        onChange={setExperienceSkills}
        disabled={isPending}
        maxSkills={20}
      />
    </OnboardingWizardShell>
  );
}
