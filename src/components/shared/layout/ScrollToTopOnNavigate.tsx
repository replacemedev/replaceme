"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Snap the window to the top on every pathname change (App Router soft navigations).
 * Uses explicit non-smooth behavior so CSS cannot reintroduce animated scrolling.
 * Does not run on search-param-only updates (filters that keep the same path).
 */
export function ScrollToTopOnNavigate() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
