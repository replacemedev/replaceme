"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeWorkerOnboarding } from "@/actions/onboarding";
import { toast } from "sonner";
import { SkillPicker } from "@/components/shared/onboarding/SkillPicker";
import {
  DEFAULT_SKILL_OPTIONS,
  ONBOARDING_SELECT_CLASS,
  WORKER_LOCATION_OPTIONS,
} from "@/config/onboarding";

export function WorkerOnboardingWizard() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [location, setLocation] = useState<string>(WORKER_LOCATION_OPTIONS[0]);
  const [skills, setSkills] = useState<string[]>([]);
  const [bio, setBio] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await completeWorkerOnboarding({
        professionalTitle,
        location,
        skills,
        bio: bio || undefined,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Profile ready — welcome to ReplaceMe!");
      router.replace("/worker/job-search");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <header className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Step 1 of 1</p>
        <h1 className="text-2xl font-bold text-slate-900">Set up your worker profile</h1>
        <p className="text-sm text-slate-600">
          Employers use this to match you with remote roles.
        </p>
      </header>

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

      <label className="block space-y-2 text-sm font-medium text-slate-700">
        Location
        <select
          required
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

      <SkillPicker
        label="Top skills"
        hint="Pick from the list or add skills that best describe your expertise."
        options={DEFAULT_SKILL_OPTIONS}
        value={skills}
        onChange={setSkills}
        maxSkills={8}
        disabled={isPending}
      />

      <label className="block space-y-2 text-sm font-medium text-slate-700">
        Short bio (optional)
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
        />
      </label>

      <button
        type="submit"
        disabled={isPending || skills.length === 0}
        className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Continue to job search"}
      </button>
    </form>
  );
}
