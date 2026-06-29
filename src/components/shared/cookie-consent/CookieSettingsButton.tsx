"use client";

import { COOKIE_CONSENT_OPEN_EVENT } from "@/lib/cookie-consent/types";

interface CookieSettingsButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function CookieSettingsButton({
  className,
  children = "Cookie settings",
}: CookieSettingsButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_OPEN_EVENT))}
    >
      {children}
    </button>
  );
}
