import * as React from "react";
import { Text } from "@react-email/components";
import { EmailLayout } from "./_components/EmailLayout";
import { BRAND } from "./_components/brand";

export type EmployerNewApplicantEmailProps = {
  companyName?: string | null;
  jobTitle: string;
  applicantName?: string | null;
  planLabel: "Starter" | "Growth" | "Scale";
  ctaUrl: string;
  siteUrl?: string;
};

export default function EmployerNewApplicantEmail({
  companyName,
  jobTitle,
  applicantName,
  planLabel,
  ctaUrl,
  siteUrl = BRAND.siteUrl,
}: EmployerNewApplicantEmailProps) {
  const greeting = companyName ? `Hi ${companyName},` : "Hi there,";
  const who = applicantName ? (
    <>
      <strong>{applicantName}</strong> just applied
    </>
  ) : (
    <>You received a new application</>
  );
  const preview = `New applicant for ${jobTitle}`;

  return (
    <EmailLayout
      preview={preview}
      title="New candidate application"
      ctaUrl={ctaUrl}
      ctaLabel="Review Applicant"
      siteUrl={siteUrl}
      settingsUrl={`${siteUrl.replace(/\/$/, "")}/employer/settings/account`}
      footerNote={`Instant alerts are included with your ${planLabel} plan.`}
    >
      <Text className="m-0 mb-3 text-[15px] leading-relaxed text-body">
        {greeting}
      </Text>
      <Text className="m-0 mb-3 text-[15px] leading-relaxed text-body">
        {who} for <strong>{jobTitle}</strong>. Review them while they’re still
        engaged — response speed improves hire rates.
      </Text>
      <Text className="m-0 text-[13px] text-muted">
        Plan: <strong className="text-ink">{planLabel}</strong>
      </Text>
    </EmailLayout>
  );
}

EmployerNewApplicantEmail.PreviewProps = {
  companyName: "Northwind Co.",
  jobTitle: "Remote Executive Assistant",
  applicantName: "Maria Santos",
  planLabel: "Growth",
  ctaUrl: "https://replaceme.ph/employer/jobs/demo/applicants",
  siteUrl: "https://replaceme.ph",
} satisfies EmployerNewApplicantEmailProps;
