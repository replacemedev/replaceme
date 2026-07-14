import * as React from "react";
import { Text } from "@react-email/components";
import { EmailLayout } from "./_components/EmailLayout";
import { BRAND } from "./_components/brand";

export type WorkerNewMessageEmailProps = {
  workerName?: string | null;
  employerName: string;
  messagePreview: string;
  ctaUrl: string;
  siteUrl?: string;
};

export default function WorkerNewMessageEmail({
  workerName,
  employerName,
  messagePreview,
  ctaUrl,
  siteUrl = BRAND.siteUrl,
}: WorkerNewMessageEmailProps) {
  const greeting = workerName ? `Hi ${workerName},` : "Hi there,";
  const preview = `${employerName} sent you a message on Replaceme`;

  return (
    <EmailLayout
      preview={preview}
      title="New message from an employer"
      ctaUrl={ctaUrl}
      ctaLabel="Reply to Message"
      siteUrl={siteUrl}
      settingsUrl={`${siteUrl.replace(/\/$/, "")}/worker/settings/notifications`}
      footerNote="For your security, never share passwords or payment details in chat."
    >
      <Text className="m-0 mb-3 text-[15px] leading-relaxed text-body">
        {greeting}
      </Text>
      <Text className="m-0 mb-3 text-[15px] leading-relaxed text-body">
        <strong>{employerName}</strong> sent you a new message:
      </Text>
      <Text className="m-0 rounded-xl border border-solid border-border bg-white px-4 py-3 text-[14px] leading-relaxed text-body italic">
        “{messagePreview}”
      </Text>
    </EmailLayout>
  );
}

WorkerNewMessageEmail.PreviewProps = {
  workerName: "Juan Dela Cruz",
  employerName: "Aria from Northwind HR",
  messagePreview:
    "Thanks for applying — are you available for a quick chat this week?",
  ctaUrl: "https://replaceme.ph/worker/messages",
  siteUrl: "https://replaceme.ph",
} satisfies WorkerNewMessageEmailProps;
