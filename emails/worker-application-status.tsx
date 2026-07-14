import * as React from "react";
import { Text } from "@react-email/components";
import { EmailLayout } from "./_components/EmailLayout";
import { BRAND } from "./_components/brand";

export type WorkerApplicationStatusEmailProps = {
  workerName?: string | null;
  jobTitle: string;
  companyName: string;
  statusTone: "viewed" | "shortlisted" | "interview" | "hired" | "declined";
  statusHeadline: string;
  statusBody: string;
  ctaUrl: string;
  siteUrl?: string;
};

export default function WorkerApplicationStatusEmail({
  workerName,
  jobTitle,
  companyName,
  statusTone,
  statusHeadline,
  statusBody,
  ctaUrl,
  siteUrl = BRAND.siteUrl,
}: WorkerApplicationStatusEmailProps) {
  const greeting = workerName ? `Hi ${workerName},` : "Hi there,";
  const preview = `${statusHeadline} — ${jobTitle} at ${companyName}`;

  return (
    <EmailLayout
      preview={preview}
      title={statusHeadline}
      ctaUrl={ctaUrl}
      ctaLabel="View Application"
      siteUrl={siteUrl}
      settingsUrl={`${siteUrl.replace(/\/$/, "")}/worker/settings/notifications`}
      footerNote="You’re receiving this because you applied through Replaceme."
    >
      <Text className="m-0 mb-3 text-[15px] leading-relaxed text-body">
        {greeting}
      </Text>
      <Text className="m-0 mb-3 text-[15px] leading-relaxed text-body">
        Update on your application for <strong>{jobTitle}</strong> at{" "}
        <strong>{companyName}</strong>:
      </Text>
      <Text className="m-0 mb-1 rounded-xl bg-accent-soft px-4 py-3 text-[14px] font-semibold text-brand">
        {statusBody}
      </Text>
      {statusTone === "declined" ? (
        <Text className="m-0 mt-3 text-[14px] leading-relaxed text-muted">
          Keep going — new roles are posted every day. Update your profile to
          improve your match rate.
        </Text>
      ) : null}
    </EmailLayout>
  );
}

WorkerApplicationStatusEmail.PreviewProps = {
  workerName: "Maria Santos",
  jobTitle: "Customer Support Specialist",
  companyName: "Harbor Labs",
  statusTone: "shortlisted",
  statusHeadline: "You've been shortlisted!",
  statusBody:
    "Great news — the employer has shortlisted your application and may reach out soon.",
  ctaUrl: "https://replaceme.ph/worker/applications",
  siteUrl: "https://replaceme.ph",
} satisfies WorkerApplicationStatusEmailProps;
