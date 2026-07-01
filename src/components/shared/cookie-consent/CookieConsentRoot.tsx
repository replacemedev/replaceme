"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  getCookieConsentForUser,
  saveCookieConsent,
} from "@/actions/cookie-consent";
import { COOKIE_POLICY_VERSION } from "@/lib/content/page-fallbacks";
import {
  buildConsent,
  consentNeedsBanner,
  getOrCreateAnonymousId,
  readStoredConsent,
  writeStoredConsent,
} from "@/lib/cookie-consent/storage";
import {
  COOKIE_CONSENT_OPEN_EVENT,
  type CookieConsentAction,
  type CookieConsentPreferences,
} from "@/lib/cookie-consent/types";
import { CookieConsentBanner } from "@/components/shared/cookie-consent/CookieConsentBanner";
import { CookieConsentModal } from "@/components/shared/cookie-consent/CookieConsentModal";

export function CookieConsentRoot() {
  const [hydrated, setHydrated] = useState(false);
  const [preferences, setPreferences] = useState<CookieConsentPreferences | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [draftAnalytics, setDraftAnalytics] = useState(false);
  const [draftMarketing, setDraftMarketing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const applyPreferences = useCallback((next: CookieConsentPreferences) => {
    writeStoredConsent(next);
    setPreferences(next);
    setShowBanner(false);
    setModalOpen(false);
    setDraftAnalytics(next.analytics);
    setDraftMarketing(next.marketing);
  }, []);

  const persist = useCallback(
    (action: CookieConsentAction, analytics: boolean, marketing: boolean) => {
      const anonymousId = getOrCreateAnonymousId();
      const next = buildConsent(analytics, marketing, anonymousId);
      applyPreferences(next);

      startTransition(async () => {
        await saveCookieConsent({
          action,
          analytics,
          marketing,
          policyVersion: COOKIE_POLICY_VERSION,
          anonymousId,
        });
      });
    },
    [applyPreferences]
  );

  useEffect(() => {
    const init = async () => {
      const local = readStoredConsent();
      let resolved = local;

      try {
        const server = await getCookieConsentForUser();
        if (server && server.policyVersion === COOKIE_POLICY_VERSION) {
          resolved = { ...server, anonymousId: getOrCreateAnonymousId() };
          writeStoredConsent(resolved);
        } else if (local && consentNeedsBanner(local) === false) {
          await saveCookieConsent({
            action: "save_preferences",
            analytics: local.analytics,
            marketing: local.marketing,
            policyVersion: COOKIE_POLICY_VERSION,
            anonymousId: getOrCreateAnonymousId(),
          });
        }
      } catch {
        // Offline or unauthenticated — local storage still applies.
      }

      setPreferences(resolved);
      setDraftAnalytics(resolved?.analytics ?? false);
      setDraftMarketing(resolved?.marketing ?? false);
      setShowBanner(consentNeedsBanner(resolved));
      setHydrated(true);
    };

    void init();
  }, []);

  useEffect(() => {
    const openModal = () => {
      setDraftAnalytics(preferences?.analytics ?? false);
      setDraftMarketing(preferences?.marketing ?? false);
      setModalOpen(true);
    };

    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, openModal);
    return () => window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, openModal);
  }, [preferences]);

  if (!hydrated) return null;

  return (
    <>
      {showBanner ? (
        <CookieConsentBanner
          onAcceptAll={() => persist("accept_all", true, true)}
          onRejectNonEssential={() => persist("reject_non_essential", false, false)}
          onManage={() => setModalOpen(true)}
        />
      ) : null}

      <CookieConsentModal
        open={modalOpen}
        analytics={draftAnalytics}
        marketing={draftMarketing}
        saving={isPending}
        onAnalyticsChange={setDraftAnalytics}
        onMarketingChange={setDraftMarketing}
        onSave={() => persist("save_preferences", draftAnalytics, draftMarketing)}
        onAcceptAll={() => persist("accept_all", true, true)}
        onRejectNonEssential={() => persist("reject_non_essential", false, false)}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
