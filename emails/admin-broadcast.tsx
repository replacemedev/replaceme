import * as React from "react";
import { Link, Section, Text } from "@react-email/components";
import { EmailLayout } from "./_components/EmailLayout";
import { BRAND } from "./_components/brand";

export type AdminBroadcastEmailProps = {
  title: string;
  /** Plain text; newlines become paragraphs. */
  body: string;
  physicalAddress: string;
  ctaUrl?: string;
  ctaLabel?: string;
  siteUrl?: string;
};

/**
 * Marketing/broadcast shell. Unsubscribe uses Resend's merge tag (not a normal URL).
 */
export function AdminBroadcastEmail({
  title,
  body,
  physicalAddress,
  ctaUrl,
  ctaLabel,
  siteUrl = BRAND.siteUrl,
}: AdminBroadcastEmailProps) {
  const paragraphs = body
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <EmailLayout
      preview={title}
      title={title}
      ctaUrl={ctaUrl}
      ctaLabel={ctaLabel}
      siteUrl={siteUrl}
    >
      {paragraphs.map((p) => (
        <Text key={p.slice(0, 24)} className="m-0 mb-3 text-[15px] leading-relaxed text-body">
          {p}
        </Text>
      ))}
      <Section className="mt-8 text-center">
        <Text className="m-0 text-[12px] leading-relaxed text-muted">
          You are receiving this because you have a {BRAND.appName} account.
        </Text>
        <Text className="m-0 mt-2 text-[12px] leading-relaxed text-muted">
          <Link
            href="{{{RESEND_UNSUBSCRIBE_URL}}}"
            className="text-accent underline"
          >
            Unsubscribe
          </Link>
        </Text>
        <Text className="m-0 mt-3 text-[11px] leading-relaxed text-[#94a3b8]">
          {physicalAddress}
        </Text>
      </Section>
    </EmailLayout>
  );
}

AdminBroadcastEmail.PreviewProps = {
  title: "Platform update",
  body: "We shipped improvements to hiring workflows.\n\nOpen your dashboard to try them.",
  physicalAddress: "123 Example St, City, Country",
  ctaUrl: "https://replaceme.ph/employer/dashboard",
  ctaLabel: "Open dashboard",
} satisfies AdminBroadcastEmailProps;

export default AdminBroadcastEmail;
