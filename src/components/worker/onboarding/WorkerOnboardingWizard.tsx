"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  finishWorkerOnboarding,
  saveWorkerOnboardingStep,
  type WorkerOnboardingDraft,
} from "@/actions/onboarding";
import { OnboardingWizardShell } from "@/components/shared/onboarding/OnboardingWizardShell";
import { ProfileAvatarUpload } from "@/components/shared/ProfileAvatarUpload";
import { profileImageHelperTextOptional } from "@/lib/storage/profile-image";
import { SkillPicker } from "@/components/shared/onboarding/SkillPicker";
import {
  DEFAULT_SKILL_OPTIONS,
  ONBOARDING_SELECT_CLASS,
  WORKER_LOCATION_OPTIONS,
} from "@/config/onboarding";
import { COMPENSATION_CURRENCIES } from "@/lib/format/currency";

const CONTENT_STEPS = 6;
const AVAILABILITY_OPTIONS = [
  "Full-time",
  "Part-time",
  "Contract",
  "Not available",
] as const;

type WizardPhase =
  | "welcome"
  | "identity"
  | "location"
  | "skills"
  | "compensation"
  | "about"
  | "project";

interface WorkerOnboardingWizardProps {
  draft: WorkerOnboardingDraft;
}

export function WorkerOnboardingWizard({ draft }: WorkerOnboardingWizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [phase, setPhase] = useState<WizardPhase>("welcome");

  const [professionalTitle, setProfessionalTitle] = useState(
    draft.professionalTitle
  );
  const [firstName, setFirstName] = useState(draft.firstName);
  const [lastName, setLastName] = useState(draft.lastName);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(draft.avatarUrl);
  const [location, setLocation] = useState(
    draft.location || WORKER_LOCATION_OPTIONS[0]
  );
  const [availability, setAvailability] = useState(draft.availability);
  const [isRemote, setIsRemote] = useState(draft.isRemote);
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
  const [birthYear, setBirthYear] = useState(
    draft.birthYear != null ? String(draft.birthYear) : ""
  );
  const [projectTitle, setProjectTitle] = useState("");
  const [projectRole, setProjectRole] = useState("");
  const [projectYear, setProjectYear] = useState(
    String(new Date().getFullYear())
  );
  const [projectDescription, setProjectDescription] = useState("");
  const [projectSkills, setProjectSkills] = useState<string[]>([]);

  const stepIndex: Record<WizardPhase, number> = {
    welcome: 0,
    identity: 1,
    location: 2,
    skills: 3,
    compensation: 4,
    about: 5,
    project: 6,
  };

  const goNext = (next: WizardPhase) => setPhase(next);
  const goBack = (prev: WizardPhase) => setPhase(prev);

  if (phase === "welcome") {
    return (
      <section className="mx-auto w-full max-w-lg space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <header className="space-y-2 text-center sm:text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            Worker onboarding
          </p>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Build a profile employers trust
          </h1>
          <p className="text-sm font-medium text-slate-600">
            A short guided setup — about 3 minutes. You can skip optional steps
            and finish later from your profile.
          </p>
        </header>
        <button
          type="button"
          onClick={() => goNext("identity")}
          className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90"
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
    return (
      <OnboardingWizardShell
        {...shellProps}
        stepLabel="Role & identity"
        title="How should employers know you?"
        description="Your name and title appear on applications and your public profile."
        onBack={() => goBack("welcome")}
        isNextDisabled={
          !professionalTitle.trim() || !firstName.trim() || !lastName.trim()
        }
        onNext={() => {
          startTransition(async () => {
            const result = await saveWorkerOnboardingStep("identity", {
              professionalTitle: professionalTitle.trim(),
              firstName: firstName.trim(),
              lastName: lastName.trim(),
            });
            if (!result.success) {
              toast.error(result.error);
              return;
            }
            goNext("location");
          });
        }}
      >
        <ProfileAvatarUpload
          avatarUrl={avatarUrl}
          displayName={
            `${firstName} ${lastName}`.trim() || professionalTitle.trim() || "Worker"
          }
          size="md"
          onAvatarChange={setAvatarUrl}
          helperText={profileImageHelperTextOptional()}
        />
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          Professional title
          <input
            required
            value={professionalTitle}
            onChange={(e) => setProfessionalTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
            placeholder="e.g. Senior React Developer"
          />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            First name
            <input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Last name
            <input
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
        </div>
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
        onNext={() => {
          startTransition(async () => {
            const result = await saveWorkerOnboardingStep("location", {
              location,
              availability,
              isRemote,
            });
            if (!result.success) {
              toast.error(result.error);
              return;
            }
            goNext("skills");
          });
        }}
      >
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          Location
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={ONBOARDING_SELECT_CLASS}
          >
            {WORKER_LOCATION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
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
        <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={isRemote}
            onChange={(e) => setIsRemote(e.target.checked)}
            className="size-4 rounded border-slate-300 text-primary focus:ring-primary/30"
          />
          Open to fully remote roles
        </label>
      </OnboardingWizardShell>
    );
  }

  if (phase === "skills") {
    return (
      <OnboardingWizardShell
        {...shellProps}
        stepLabel="Top skills"
        title="What are your strongest skills?"
        description="Pick at least one — these power job matching and your profile."
        onBack={() => goBack("location")}
        isNextDisabled={skills.length === 0}
        onNext={() => {
          startTransition(async () => {
            const result = await saveWorkerOnboardingStep("skills", { skills });
            if (!result.success) {
              toast.error(result.error);
              return;
            }
            goNext("compensation");
          });
        }}
      >
        <SkillPicker
          label="Top skills"
          hint="Pick from the list or add skills that best describe your expertise."
          options={DEFAULT_SKILL_OPTIONS}
          value={skills}
          onChange={setSkills}
          maxSkills={8}
          disabled={isPending}
        />
      </OnboardingWizardShell>
    );
  }

  if (phase === "compensation") {
    return (
      <OnboardingWizardShell
        {...shellProps}
        stepLabel="Compensation"
        title="Set your rate expectations"
        description="Optional — helps employers filter for budget fit. Billing stays in USD on paid plans."
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
              toast.error(result.error);
              return;
            }
            goNext("about");
          });
        }}
      >
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
        stepLabel="About you"
        title="Tell employers your story"
        description="A short bio builds trust — you can expand this anytime on your profile."
        onBack={() => goBack("compensation")}
        canSkip
        onSkip={() => goNext("project")}
        onNext={() => {
          startTransition(async () => {
            const result = await saveWorkerOnboardingStep("about", {
              bio: bio.trim() || undefined,
              birthYear: birthYear.trim() ? Number(birthYear) : null,
            });
            if (!result.success) {
              toast.error(result.error);
              return;
            }
            goNext("project");
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
          Birth year (optional)
          <input
            type="number"
            min={1940}
            max={new Date().getFullYear()}
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
        </label>
      </OnboardingWizardShell>
    );
  }

  const hasProjectDraft =
    projectTitle.trim() ||
    projectRole.trim() ||
    projectDescription.trim() ||
    projectSkills.length > 0;

  return (
    <OnboardingWizardShell
      {...shellProps}
      stepLabel="Project spotlight"
      title="Showcase a recent project"
      description="Optional — one strong project helps you stand out in search."
      onBack={() => goBack("about")}
      canSkip
      onSkip={() => {
        startTransition(async () => {
          const result = await finishWorkerOnboarding();
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          toast.success("Profile ready — welcome to ReplaceMe!");
          router.replace("/worker/dashboard");
          router.refresh();
        });
      }}
      nextLabel="Finish & go to dashboard"
      isNextDisabled={Boolean(
        hasProjectDraft &&
          (!projectTitle.trim() ||
            !projectRole.trim() ||
            !projectDescription.trim() ||
            projectSkills.length === 0)
      )}
      onNext={() => {
        startTransition(async () => {
          if (hasProjectDraft) {
            const result = await saveWorkerOnboardingStep("project", {
              title: projectTitle.trim(),
              role: projectRole.trim(),
              year: Number(projectYear),
              description: projectDescription.trim(),
              skillsUsed: projectSkills,
            });
            if (!result.success) {
              toast.error(result.error);
              return;
            }
          }
          const result = await finishWorkerOnboarding();
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          toast.success("Profile ready — welcome to ReplaceMe!");
          router.replace("/worker/dashboard");
          router.refresh();
        });
      }}
    >
      <label className="block space-y-2 text-sm font-medium text-slate-700">
        Project title
        <input
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
          placeholder="e.g. E-commerce redesign"
        />
      </label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          Your role
          <input
            value={projectRole}
            onChange={(e) => setProjectRole(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
        </label>
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          Year
          <input
            type="number"
            value={projectYear}
            onChange={(e) => setProjectYear(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
        </label>
      </div>
      <label className="block space-y-2 text-sm font-medium text-slate-700">
        Description
        <textarea
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
        />
      </label>
      <SkillPicker
        label="Skills used"
        hint="Technologies or skills you applied on this project."
        options={DEFAULT_SKILL_OPTIONS}
        value={projectSkills}
        onChange={setProjectSkills}
        maxSkills={8}
        disabled={isPending}
      />
    </OnboardingWizardShell>
  );
}
