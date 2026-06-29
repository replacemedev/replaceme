"use client";

import { AuthMarketingPanel } from "@/components/auth/AuthMarketingPanel";
import { AUTH_CARD, AUTH_TITLE, AUTH_SUBTITLE } from "@/lib/auth/ui-tokens";
import type { AuthScreenConfig } from "@/types/page-content";

interface PageContentPreviewProps {
  slug: string;
  config: AuthScreenConfig;
}

export function PageContentPreview({ slug, config }: PageContentPreviewProps) {
  const isLoginFamily =
    slug === "auth-login" ||
    slug === "auth-forgot-password" ||
    slug === "auth-update-password";

  return (
    <aside className="xl:sticky xl:top-24 space-y-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        Live preview
      </p>
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 space-y-4">
        <div className="rounded-2xl bg-white border border-slate-100 p-4 space-y-3">
          <h3 className={AUTH_TITLE}>
            {config.headline?.trim() || "Headline preview"}
          </h3>
          {config.description ? (
            <p className={AUTH_SUBTITLE}>{config.description}</p>
          ) : null}
          <div className={`${AUTH_CARD} p-4 text-center text-xs text-slate-400`}>
            Form fields ({slug})
          </div>
          {config.signupPrompt && config.signupLinkLabel ? (
            <p className="text-center text-xs text-slate-500">
              {config.signupPrompt}{" "}
              <span className="font-bold text-[#006e2f]">
                {config.signupLinkLabel}
              </span>
            </p>
          ) : null}
        </div>
        {isLoginFamily ? (
          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-3">
            <AuthMarketingPanel content={config} variant="testimonial" />
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-100 bg-white p-3">
            <AuthMarketingPanel content={config} variant="brand" />
          </div>
        )}
      </div>
    </aside>
  );
}
