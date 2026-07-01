"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getUxPreferencesForUser } from "@/actions/ux-preferences";
import {
  getClientUxCookies,
  hasCookieConsent,
  setUxCookie,
} from "@/lib/cookies/client";
import { UX_SIDEBAR_COOKIE, UX_THEME_COOKIE } from "@/lib/cookies/constants";
import { applyThemeClassToDocument } from "@/lib/cookies/theme";

export function UxPreferenceBootstrap() {
  const synced = useRef(false);

  useEffect(() => {
    if (synced.current || !hasCookieConsent()) return;
    synced.current = true;

    const run = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const dbPrefs = await getUxPreferencesForUser();
      if (!dbPrefs) return;

      const cookies = getClientUxCookies();

      if (dbPrefs.theme !== cookies.theme) {
        setUxCookie(UX_THEME_COOKIE, dbPrefs.theme);
        applyThemeClassToDocument(dbPrefs.theme);
      }

      const sidebarValue = dbPrefs.sidebarCollapsed ? "collapsed" : "expanded";
      if (sidebarValue !== cookies.sidebar) {
        setUxCookie(UX_SIDEBAR_COOKIE, sidebarValue);
      }
    };

    void run();
  }, []);

  return null;
}
