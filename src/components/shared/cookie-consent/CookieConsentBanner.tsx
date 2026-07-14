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
      className="animate-in fade-in slide-in-from-bottom-4 fixed inset-x-3 bottom-3 z-[60] duration-300 sm:inset-x-auto sm:right-auto sm:bottom-6 sm:left-6 sm:w-full sm:max-w-md"
    >
      <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.14)] backdrop-blur-md sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Cookie className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2
              id="cookie-consent-title"
              className="text-sm font-bold text-slate-900 sm:text-base"
            >
              We value your privacy
            </h2>
            <p
              id="cookie-consent-desc"
              className="mt-1.5 text-sm leading-relaxed text-slate-600"
            >
              Strictly necessary cookies keep Replaceme secure. Analytics and marketing stay off
              until you choose. Read our{" "}
              <Link
                href="/cookie-policy"
                className="font-semibold text-[#006e2f] underline-offset-2 hover:underline"
              >
                Cookie Policy
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              size="sm"
              className="!w-full sm:flex-1"
              onClick={onAcceptAll}
            >
              Accept all
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="!w-full sm:flex-1"
              onClick={onRejectNonEssential}
            >
              Reject non-essential
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="!w-full text-slate-600 hover:text-slate-900"
            onClick={onManage}
          >
            Manage preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
