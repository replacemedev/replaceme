"use client";

import { ThemeToggle } from "@/components/shared/ThemeToggle";

export function ThemePreferenceRow() {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Appearance</h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Choose how navigation and shell chrome look. Requires cookie consent to save.
      </p>
      <div className="mt-4">
        <ThemeToggle variant="segmented" />
      </div>
    </section>
  );
}
