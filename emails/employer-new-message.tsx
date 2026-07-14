import * as React from "react";
import { Text } from "@react-email/components";
import { EmailLayout } from "./_components/EmailLayout";
import { BRAND } from "./_components/brand";

export type EmployerNewMessageEmailProps = {
  employerName?: string | null;
  workerName: string;
  messagePreview: string;
  ctaUrl: string;
  planLabel: "Starter" | "Growth" | "Scale";
  siteUrl?: string;
};

export default function EmployerNewMessageEmail({
  employerName,
  workerName,
  messagePreview,
  ctaUrl,
  planLabel,
  siteUrl = BRAND.siteUrl,
}: EmployerNewMessageEmailProps) {
  const greeting = employerName ? `Hi ${employerName},` : "Hi there,";
  const preview = `${workerName} replied to your message`;

  return (
    <EmailLayout
      preview={preview}
      title="New message from a candidate"
      ctaUrl={ctaUrl}
      ctaLabel="Reply to Message"
      siteUrl={siteUrl}
      settingsUrl={`${siteUrl.replace(/\/$/, "")}/employer/settings/account`}
      footerNote={`Message alerts are included with your ${planLabel} plan.`}
    >
      <Text className="m-0 mb-3 text-[15px] leading-relaxed text-body">
        {greeting}
      </Text>
      <Text className="m-0 mb-3 text-[15px] leading-relaxed text-body">
        <strong>{workerName}</strong> replied in your Replaceme conversation:
      </Text>
      <Text className="m-0 rounded-xl border border-solid border-border bg-white px-4 py-3 text-[14px] leading-relaxed text-body italic">
        “{messagePreview}”
      </Text>
    </EmailLayout>
  );
}

EmployerNewMessageEmail.PreviewProps = {
  employerName: "Aria",
  workerName: "Juan Dela Cruz",
  messagePreview: "Yes — I’m free Thursday after 2pm PHT.",
  ctaUrl: "https://replaceme.ph/employer/messages",
  planLabel: "Starter",
  siteUrl: "https://replaceme.ph",
} satisfies EmployerNewMessageEmailProps;
