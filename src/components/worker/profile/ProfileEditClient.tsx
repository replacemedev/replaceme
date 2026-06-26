"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { updateWorkerProfile } from "@/actions/worker/profile";
import type { WorkerProjectRow } from "@/lib/validations/worker/phase2";

interface ProfileEditClientProps {
  initial: {
    firstName: string;
    lastName: string;
    professionalTitle: string;
    bio: string;
    location: string;
    portfolioUrl: string;
    resumeUrl: string;
    cvUrl: string;
  };
  projects: WorkerProjectRow[];
}

export function ProfileEditClient({ initial, projects }: ProfileEditClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateWorkerProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        professionalTitle: form.professionalTitle,
        bio: form.bio || undefined,
        location: form.location || undefined,
        portfolioUrl: form.portfolioUrl,
        resumeUrl: form.resumeUrl,
        cvUrl: form.cvUrl,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Profile updated");
      router.push("/worker/profile");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Basic Info
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block text-sm font-medium text-slate-700">
            First name
            <input
              required
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Last name
            <input
              required
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="block text-sm font-medium text-slate-700">
          Professional title
          <input
            required
            value={form.professionalTitle}
            onChange={(e) =>
              setForm({ ...form, professionalTitle: e.target.value })
            }
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Bio
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Location
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Resume & Portfolio
        </h2>
        <label className="block text-sm font-medium text-slate-700">
          Portfolio URL
          <input
            type="url"
            value={form.portfolioUrl}
            onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
            placeholder="https://"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Resume URL
          <input
            type="url"
            value={form.resumeUrl}
            onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })}
            placeholder="https://"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          CV URL
          <input
            type="url"
            value={form.cvUrl}
            onChange={(e) => setForm({ ...form, cvUrl: e.target.value })}
            placeholder="https://"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Portfolio Projects ({projects.length})
        </h2>
        {projects.length === 0 ? (
          <p className="text-sm text-slate-500">No projects yet.</p>
        ) : (
          <ul className="space-y-2 text-sm text-slate-700">
            {projects.map((p) => (
              <li key={p.id} className="font-medium">
                {p.title} — {p.role} ({p.year})
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2.5 text-sm font-bold text-white bg-[#006e2f] hover:bg-[#005c26] rounded-xl disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save Profile"}
        </button>
        <Link
          href="/worker/profile"
          className="text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
