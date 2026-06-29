"use client";

import Link from "next/link";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CookieConsentBannerProps {
  onAcceptAll: () => void;
  onRejectNonEssential: () => void;
  onManage: () => void;
}

export function CookieConsentBanner({
  onAcceptAll,
  onRejectNonEssential,
  onManage,
}: CookieConsentBannerProps) {
  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200 bg-white/95 p-4 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-5"
    >
      <div className="mx-auto flex max-w-container-max flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Cookie className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 id="cookie-consent-title" className="text-sm font-bold text-slate-900 sm:text-base">
              We use cookies
            </h2>
            <p id="cookie-consent-desc" className="mt-1 text-sm leading-relaxed text-slate-600">
              Strictly necessary cookies keep Replace Me secure and working. Analytics and
              marketing cookies are optional — we only enable them if you agree. Read our{" "}
              <Link href="/cookie-policy" className="font-semibold text-[#006e2f] hover:underline">
                Cookie Policy
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:shrink-0 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="!w-full sm:!w-auto"
            onClick={onManage}
          >
            Manage preferences
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="!w-full sm:!w-auto"
            onClick={onRejectNonEssential}
          >
            Reject non-essential
          </Button>
          <Button
            type="button"
            size="sm"
            className="!w-full sm:!w-auto"
            onClick={onAcceptAll}
          >
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}
