import type { ThemePreference } from "@/lib/cookies/constants";

export function resolveThemeClass(
  theme: ThemePreference,
  prefersDark = false
): "" | "dark" {
  if (theme === "dark") return "dark";
  if (theme === "light") return "";
  return prefersDark ? "dark" : "";
}

export function readSystemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyThemeClassToDocument(
  theme: ThemePreference,
  prefersDark = readSystemPrefersDark()
): void {
  if (typeof document === "undefined") return;
  const isDark = resolveThemeClass(theme, prefersDark) === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
}
