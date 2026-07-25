"use client";

import { useEffect } from "react";

/**
 * Scrolls to the audit log section when `section=audit` is present.
 * Query params are more reliable than hash fragments with App Router client navigations.
 */
export function ApplicationAuditScroll({ section }: { section?: string | null }) {
  useEffect(() => {
    if (section !== "audit") return;

    const scroll = () => {
      document
        .getElementById("audit-log")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // Wait a frame so the layout (incl. sticky admin chrome) has settled.
    const id = window.requestAnimationFrame(scroll);
    const timeout = window.setTimeout(scroll, 120);
    return () => {
      window.cancelAnimationFrame(id);
      window.clearTimeout(timeout);
    };
  }, [section]);

  return null;
}
