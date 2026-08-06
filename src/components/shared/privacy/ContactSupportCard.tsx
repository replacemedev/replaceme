"use client";

import { useState } from "react";
import { LifeBuoy, Mail, Copy, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";
import { DELETION_REQUEST_SUPPORT_EMAIL } from "@/lib/data/legal";
import {
  buildGmailComposeUrl,
  buildSupportMailto,
} from "@/lib/email/support-mailto";

interface ContactSupportCardProps {
  title?: string;
  description?: string;
  subject?: string;
  className?: string;
}

export function ContactSupportCard({
  title = "Need help?",
  description = "Our support team can help with account, billing, or safety concerns.",
  subject = "Support request",
  className = "",
}: ContactSupportCardProps) {
  const [copied, setCopied] = useState(false);
  const mailto = buildSupportMailto(DELETION_REQUEST_SUPPORT_EMAIL, subject);
  const gmailCompose = buildGmailComposeUrl(
    DELETION_REQUEST_SUPPORT_EMAIL,
    subject
  );

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(DELETION_REQUEST_SUPPORT_EMAIL);
    setCopied(true);
    toast.success(`Copied ${DELETION_REQUEST_SUPPORT_EMAIL} to clipboard`);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleContactClick = () => {
    // Copy support email as safety net if mailto fails on desktop/mobile without default mail app
    navigator.clipboard.writeText(DELETION_REQUEST_SUPPORT_EMAIL);
    toast.success(`Opening email client (Copied ${DELETION_REQUEST_SUPPORT_EMAIL})`);
  };

  return (
    <div
      className={`h-fit rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:p-6 ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ebfdf2] text-[#006e2f]">
          <LifeBuoy className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2 sm:gap-3">
        <a
          href={mailto}
          onClick={handleContactClick}
          className="inline-flex min-h-11 flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-[#006e2f] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#005c26] [-webkit-tap-highlight-color:transparent]"
        >
          <Mail className="h-4 w-4 shrink-0" aria-hidden />
          Contact support
        </a>
        <a
          href={gmailCompose}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 [-webkit-tap-highlight-color:transparent]"
          title="Open in Gmail Web"
        >
          <ExternalLink className="h-3.5 w-3.5 text-slate-400" aria-hidden />
          Gmail
        </a>
        <button
          type="button"
          onClick={handleCopyEmail}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 [-webkit-tap-highlight-color:transparent]"
          title="Copy support email address"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              Copy email
            </>
          )}
        </button>
      </div>
    </div>
  );
}

