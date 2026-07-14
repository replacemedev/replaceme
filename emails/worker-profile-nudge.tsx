import * as React from "react";
import { Text } from "@react-email/components";
import { EmailLayout } from "./_components/EmailLayout";
import { BRAND } from "./_components/brand";

export type WorkerProfileNudgeEmailProps = {
  workerName?: string | null;
  missingItems: string[];
  ctaUrl: string;
  siteUrl?: string;
};

export default function WorkerProfileNudgeEmail({
  workerName,
  missingItems,
  ctaUrl,
  siteUrl = BRAND.siteUrl,
}: WorkerProfileNudgeEmailProps) {
  const greeting = workerName ? `Hi ${workerName},` : "Hi there,";
  const preview = "Complete your Replaceme profile to get more interviews";

  return (
    <EmailLayout
      preview={preview}
      title="Finish your profile — get discovered faster"
      ctaUrl={ctaUrl}
      ctaLabel="Complete Profile"
      siteUrl={siteUrl}
      settingsUrl={`${siteUrl.replace(/\/$/, "")}/worker/settings/notifications`}
      footerNote="We only send this nudge once after signup when your profile still looks incomplete."
    >
      <Text className="m-0 mb-3 text-[15px] leading-relaxed text-body">
        {greeting}
      </Text>
      <Text className="m-0 mb-3 text-[15px] leading-relaxed text-body">
        You’re almost set up on Replaceme. Completing these items helps employers
        trust and contact you:
      </Text>
      {missingItems.map((item) => (
        <Text
          key={item}
          className="m-0 mb-1 text-[14px] leading-relaxed text-body"
        >
          • {item}
        </Text>
      ))}
    </EmailLayout>
  );
}

WorkerProfileNudgeEmail.PreviewProps = {
  workerName: "Ana Reyes",
  missingItems: [
    "Upload a government ID for verification",
    "Add at least 3 skills",
  ],
  ctaUrl: "https://replaceme.ph/worker/profile",
  siteUrl: "https://replaceme.ph",
} satisfies WorkerProfileNudgeEmailProps;
