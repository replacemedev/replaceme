import * as React from "react";
import { Text } from "@react-email/components";
import { EmailLayout } from "./_components/EmailLayout";
import { BRAND } from "./_components/brand";

export type SubscriptionAlertKind =
  | "upgraded"
  | "downgraded"
  | "payment_failed"
  | "canceled";

export type EmployerSubscriptionAlertEmailProps = {
  employerName?: string | null;
  kind: SubscriptionAlertKind;
  planLabel: string;
  previousPlanLabel?: string | null;
  amountLabel?: string | null;
  ctaUrl: string;
  ctaLabel?: string;
  siteUrl?: string;
};

function copyForKind(input: {
  kind: SubscriptionAlertKind;
  planLabel: string;
  previousPlanLabel?: string | null;
  amountLabel?: string | null;
}): { title: string; body: string; preview: string } {
  switch (input.kind) {
    case "upgraded":
      return {
        title: `Your ${input.planLabel} plan is active`,
        preview: `Your plan has been upgraded to ${input.planLabel}`,
        body: input.previousPlanLabel
          ? `Your subscription moved from ${input.previousPlanLabel} to ${input.planLabel}. New limits and premium email alerts apply immediately.`
          : `Your ${input.planLabel} subscription is now active. Premium hiring tools and email alerts are unlocked.`,
      };
    case "downgraded":
      return {
        title: `Plan updated to ${input.planLabel}`,
        preview: `Your plan changed to ${input.planLabel}`,
        body: `Your subscription is now on ${input.planLabel}. Some premium email alerts may no longer apply.`,
      };
    case "payment_failed":
      return {
        title: "Payment failed — update your billing",
        preview: "We couldn’t process your Replaceme subscription payment",
        body: input.amountLabel
          ? `We couldn’t charge ${input.amountLabel} for your ${input.planLabel} plan. Update your payment method to avoid interruption.`
          : `We couldn’t process payment for your ${input.planLabel} plan. Update your payment method to avoid interruption.`,
      };
    case "canceled":
      return {
        title: "Subscription canceled",
        preview: "Your Replaceme subscription was canceled",
        body: `Your ${input.planLabel} subscription has been canceled. You can resubscribe anytime from Account & Billing.`,
      };
  }
}

export default function EmployerSubscriptionAlertEmail({
  employerName,
  kind,
  planLabel,
  previousPlanLabel,
  amountLabel,
  ctaUrl,
  ctaLabel,
  siteUrl = BRAND.siteUrl,
}: EmployerSubscriptionAlertEmailProps) {
  const greeting = employerName ? `Hi ${employerName},` : "Hi there,";
  const copy = copyForKind({
    kind,
    planLabel,
    previousPlanLabel,
    amountLabel,
  });
  const buttonLabel =
    ctaLabel ??
    (kind === "payment_failed" ? "Update Billing" : "Manage Plan");

  return (
    <EmailLayout
      preview={copy.preview}
      title={copy.title}
      ctaUrl={ctaUrl}
      ctaLabel={buttonLabel}
      siteUrl={siteUrl}
      settingsUrl={`${siteUrl.replace(/\/$/, "")}/employer/settings/account`}
      footerNote="Billing emails are sent for account security and may not be disabled."
    >
      <Text className="m-0 mb-3 text-[15px] leading-relaxed text-body">
        {greeting}
      </Text>
      <Text className="m-0 text-[15px] leading-relaxed text-body">{copy.body}</Text>
    </EmailLayout>
  );
}

EmployerSubscriptionAlertEmail.PreviewProps = {
  employerName: "Aria",
  kind: "upgraded",
  planLabel: "Growth",
  previousPlanLabel: "Starter",
  amountLabel: null,
  ctaUrl: "https://replaceme.ph/employer/settings/account",
  siteUrl: "https://replaceme.ph",
} satisfies EmployerSubscriptionAlertEmailProps;
