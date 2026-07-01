"use client";

import { ThemeProvider } from "@/components/shared/ThemeProvider";
import type { ThemePreference } from "@/lib/cookies/constants";

interface UxProvidersProps {
  initialTheme: ThemePreference;
  children: React.ReactNode;
  onThemeChange?: (theme: ThemePreference) => void;
}

export function UxProviders({
  initialTheme,
  children,
  onThemeChange,
}: UxProvidersProps) {
  return (
    <ThemeProvider initialTheme={initialTheme} onThemeChange={onThemeChange}>
      {children}
    </ThemeProvider>
  );
}
