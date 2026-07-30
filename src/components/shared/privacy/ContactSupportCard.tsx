import { LifeBuoy, Mail } from "lucide-react";
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
  // Native <a> required: next/link intercepts navigation and does not open mailto: clients.
  // Never use target="_blank" on mailto: — Brave/Chrome open a stranded blank tab instead.
  const mailto = buildSupportMailto(DELETION_REQUEST_SUPPORT_EMAIL, subject);
  const gmailCompose = buildGmailComposeUrl(
    DELETION_REQUEST_SUPPORT_EMAIL,
    subject
  );

  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:p-6 ${className}`}
    >
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ebfdf2] text-[#006e2f]">
            <LifeBuoy className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              {description}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
          <a
            href={mailto}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#006e2f] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#005c26] sm:w-auto [-webkit-tap-highlight-color:transparent]"
          >
            <Mail className="h-4 w-4 shrink-0" aria-hidden />
            Contact support
          </a>
          <a
            href={gmailCompose}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[#006e2f] hover:underline sm:text-right"
          >
            {DELETION_REQUEST_SUPPORT_EMAIL}
          </a>
        </div>
      </div>
    </div>
  );
}
