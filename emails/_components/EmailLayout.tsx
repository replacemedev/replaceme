import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
  pixelBasedPreset,
} from "@react-email/components";
import { BRAND, brandLogoUrl } from "./brand";

export type EmailLayoutProps = {
  preview: string;
  title: string;
  children: React.ReactNode;
  ctaUrl?: string;
  ctaLabel?: string;
  /** Absolute site origin — defaults to production. */
  siteUrl?: string;
  /** Settings / unsubscribe destination (role-specific). */
  settingsUrl?: string;
  footerNote?: string;
};

export function EmailLayout({
  preview,
  title,
  children,
  ctaUrl,
  ctaLabel,
  siteUrl = BRAND.siteUrl,
  settingsUrl,
  footerNote,
}: EmailLayoutProps) {
  const origin = siteUrl.replace(/\/$/, "");
  const logoUrl = brandLogoUrl(origin);
  const year = 2026;
  const manageUrl =
    settingsUrl ?? `${origin}/worker/settings/notifications`;

  return (
    <Html lang="en">
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                brand: BRAND.primary,
                accent: BRAND.accent,
                "accent-soft": BRAND.accentSoft,
                muted: BRAND.muted,
                ink: BRAND.text,
                body: BRAND.body,
                border: BRAND.border,
                canvas: BRAND.bg,
              },
            },
          },
        }}
      >
        <Head />
        <Preview>{preview}</Preview>
        <Body className="m-0 bg-canvas font-sans text-ink antialiased">
          <Container className="mx-auto max-w-[560px] px-4 py-10">
            <Section className="mb-6">
              <Img
                src={logoUrl}
                width={40}
                height={40}
                alt={BRAND.appName}
                style={{
                  display: "block",
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: 10,
                }}
              />
              <Text className="m-0 text-[20px] font-extrabold leading-none tracking-tight text-brand">
                {BRAND.appName}
              </Text>
              <Text className="m-0 mt-1 text-[12px] font-medium text-muted">
                {BRAND.tagline}
              </Text>
            </Section>

            <Section className="overflow-hidden rounded-[20px] border border-solid border-border bg-white shadow-sm">
              <Section className="h-1 bg-accent" />
              <Section className="px-6 py-7">
                <Heading className="m-0 mb-3 text-[20px] font-extrabold leading-snug tracking-tight text-ink">
                  {title}
                </Heading>
                <Section className="text-[15px] leading-relaxed text-body">
                  {children}
                </Section>
                {ctaUrl && ctaLabel ? (
                  <Section className="mt-6">
                    <Button
                      href={ctaUrl}
                      className="box-border rounded-xl bg-accent px-5 py-3 text-center text-[14px] font-bold tracking-tight text-white no-underline"
                    >
                      {ctaLabel}
                    </Button>
                  </Section>
                ) : null}
              </Section>
            </Section>

            <Section className="mt-5 px-2 text-center">
              {footerNote ? (
                <Text className="m-0 mb-2 text-[12px] leading-relaxed text-muted">
                  {footerNote}
                </Text>
              ) : null}
              <Text className="m-0 text-[11px] leading-relaxed text-[#94a3b8]">
                © {year} {BRAND.appName}. All rights reserved.
              </Text>
              <Text className="m-0 mt-2 text-[11px] leading-relaxed text-[#94a3b8]">
                <Link
                  href={origin}
                  className="text-accent no-underline"
                >
                  replaceme.ph
                </Link>
                {" · "}
                <Link
                  href={manageUrl}
                  className="text-accent no-underline"
                >
                  Email settings / unsubscribe
                </Link>
                {" · "}
                <Link
                  href={`mailto:${BRAND.supportEmail}`}
                  className="text-accent no-underline"
                >
                  {BRAND.supportEmail}
                </Link>
              </Text>
              <Hr className="my-4 border-border" />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
