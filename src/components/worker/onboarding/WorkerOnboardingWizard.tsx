"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeWorkerOnboarding } from "@/actions/onboarding";
import { toast } from "sonner";

const SKILL_OPTIONS = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "Design",
  "Marketing",
  "Customer Support",
  "Data Entry",
];

export function WorkerOnboardingWizard() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [location, setLocation] = useState("Remote");
  const [skills, setSkills] = useState<string[]>([]);
  const [bio, setBio] = useState("");

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

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
        <input
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-700">Top skills</legend>
        <div className="flex flex-wrap gap-2">
          {SKILL_OPTIONS.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${
                skills.includes(skill)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </fieldset>

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
