"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/shared/ThemeProvider";
import type { ThemePreference } from "@/lib/cookies/constants";

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

interface ThemeToggleProps {
  variant?: "icon" | "segmented";
  className?: string;
}

export function ThemeToggle({ variant = "icon", className = "" }: ThemeToggleProps) {
  const { theme, setTheme, canPersist } = useTheme();

  if (!canPersist) {
    return (
      <span
        className={`text-xs text-slate-400 ${className}`}
        title="Accept cookies to save theme preference"
      >
        Theme
      </span>
    );
  }

  if (variant === "segmented") {
    return (
      <div
        className={`inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800 ${className}`}
        role="group"
        aria-label="Theme preference"
      >
        {OPTIONS.map(({ value, label, icon: Icon }) => {
          const active = theme === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                active
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
              aria-pressed={active}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  const cycle: ThemePreference[] = ["light", "dark", "system"];
  const currentIndex = cycle.indexOf(theme);
  const next = cycle[(currentIndex + 1) % cycle.length] ?? "system";
  const CurrentIcon =
    theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 ${className}`}
      title={`Theme: ${theme}. Click to switch.`}
      aria-label={`Theme: ${theme}. Click to switch.`}
    >
      <CurrentIcon className="h-4 w-4" aria-hidden />
    </button>
  );
}
