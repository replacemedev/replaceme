"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ThemePreference } from "@/lib/cookies/constants";
import { UX_THEME_COOKIE } from "@/lib/cookies/constants";
import {
  getClientUxCookies,
  hasCookieConsent,
  setUxCookie,
} from "@/lib/cookies/client";
import {
  applyThemeClassToDocument,
  readSystemPrefersDark,
  resolveThemeClass,
} from "@/lib/cookies/theme";

type ThemeContextValue = {
  theme: ThemePreference;
  resolvedDark: boolean;
  setTheme: (theme: ThemePreference) => void;
  canPersist: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = use(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

interface ThemeProviderProps {
  initialTheme: ThemePreference;
  children: React.ReactNode;
  onThemeChange?: (theme: ThemePreference) => void;
}

export function ThemeProvider({
  initialTheme,
  children,
  onThemeChange,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemePreference>(initialTheme);
  const [resolvedDark, setResolvedDark] = useState(
    () => resolveThemeClass(initialTheme, readSystemPrefersDark()) === "dark"
  );

  const applyTheme = useCallback((next: ThemePreference) => {
    const prefersDark = readSystemPrefersDark();
    const isDark = resolveThemeClass(next, prefersDark) === "dark";
    applyThemeClassToDocument(next, prefersDark);
    setThemeState(next);
    setResolvedDark(isDark);
  }, []);

  useEffect(() => {
    const client = getClientUxCookies();
    if (client.hasConsent && client.theme !== theme) {
      applyTheme(client.theme);
    }
  }, [applyTheme, theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const isDark = resolveThemeClass("system", media.matches) === "dark";
      applyThemeClassToDocument("system", media.matches);
      setResolvedDark(isDark);
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback(
    (next: ThemePreference) => {
      if (!hasCookieConsent()) return;
      setUxCookie(UX_THEME_COOKIE, next);
      applyTheme(next);
      onThemeChange?.(next);
    },
    [applyTheme, onThemeChange]
  );

  const value = useMemo(
    () => ({
      theme,
      resolvedDark,
      setTheme,
      canPersist: hasCookieConsent(),
    }),
    [theme, resolvedDark, setTheme]
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
