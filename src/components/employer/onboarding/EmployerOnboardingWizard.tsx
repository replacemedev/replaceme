"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeEmployerOnboarding } from "@/actions/onboarding";
import { toast } from "sonner";

const INDUSTRIES = [
  "Technology",
  "E-commerce",
  "Healthcare",
  "Finance",
  "Education",
  "Other",
];

export function EmployerOnboardingWizard() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [companyBio, setCompanyBio] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await completeEmployerOnboarding({
        companyName,
        industry,
        websiteUrl: websiteUrl || undefined,
        companyBio: companyBio || undefined,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Company profile created!");
      router.replace("/employer/dashboard");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <header className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Step 1 of 1</p>
        <h1 className="text-2xl font-bold text-slate-900">Tell us about your company</h1>
        <p className="text-sm text-slate-600">
          Workers see this when you post jobs and review applicants.
        </p>
      </header>

      <label className="block space-y-2 text-sm font-medium text-slate-700">
        Company name
        <input
          required
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
        />
      </label>

      <label className="block space-y-2 text-sm font-medium text-slate-700">
        Industry
        <select
          required
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
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
        Website (optional)
        <input
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
          placeholder="https://"
        />
      </label>

      <label className="block space-y-2 text-sm font-medium text-slate-700">
        Company bio (optional)
        <textarea
          value={companyBio}
          onChange={(e) => setCompanyBio(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Go to dashboard"}
      </button>
    </form>
  );
}
