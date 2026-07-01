"use client";

import { UxProviders } from "@/components/shared/UxProviders";
import type { ThemePreference } from "@/lib/cookies/constants";
import { saveUxPreferences } from "@/actions/ux-preferences";

interface UxProvidersWithSyncProps {
  initialTheme: ThemePreference;
  children: React.ReactNode;
}

export function UxProvidersWithSync({ initialTheme, children }: UxProvidersWithSyncProps) {
  const handleThemeChange = (theme: ThemePreference) => {
    void saveUxPreferences({ theme });
  };

  return (
    <UxProviders initialTheme={initialTheme} onThemeChange={handleThemeChange}>
      {children}
    </UxProviders>
  );
}
