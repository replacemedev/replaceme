import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ResponsiveToaster } from "@/components/shared/ResponsiveToaster";
import { CookieConsentRoot } from "@/components/shared/cookie-consent";
import { COOKIE_CONSENT_STORAGE_KEY } from "@/lib/cookie-consent/types";
import { COOKIE_POLICY_VERSION } from "@/lib/content/page-fallbacks";
import { getNavSession } from "@/lib/auth/nav-session";
import { SessionProvider } from "@/providers/SessionProvider";
import { OrganizationSchema } from "@/components/seo";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["600"],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Replaceme — Hire Top Filipino Remote Talent",
    template: "%s | Replaceme",
  },
  description:
    "Connect directly with top-tier Filipino remote talent or find your dream remote job. No agency fees, no salary commissions. Replaceme is the direct-hire marketplace for global employers and Filipino professionals.",
  keywords: [
    "hire Filipino remote workers",
    "Filipino remote talent",
    "remote jobs Philippines",
    "direct hire marketplace",
    "no agency fees remote hiring",
    "Filipino virtual assistant",
    "remote jobs for Filipinos",
    "SaaS hiring platform Philippines",
  ],
  authors: [{ name: "Replaceme", url: BASE_URL }],
  creator: "Replaceme",
  publisher: "Replaceme",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: BASE_URL,
    siteName: "Replaceme",
    title: "Replaceme — Hire Top Filipino Remote Talent",
    description:
      "Skip the agencies. Hire top-tier Filipino remote professionals directly. Flat subscription, zero commission, zero middlemen.",
    images: [
      {
        url: "/images/og-default.png",
        width: 1200,
        height: 630,
        alt: "Replaceme — Direct Filipino Remote Talent Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Replaceme — Hire Top Filipino Remote Talent",
    description:
      "Skip the agencies. Hire top-tier Filipino remote professionals directly. Flat subscription, zero commission, zero middlemen.",
    images: ["/images/og-default.png"],
    creator: "@replacemeph",
  },
  icons: {
    icon: "/images/logo_favicon.png",
    shortcut: "/images/logo_favicon.png",
    apple: "/images/logo_favicon.png",
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getNavSession();

  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var raw=localStorage.getItem(${JSON.stringify(COOKIE_CONSENT_STORAGE_KEY)});if(!raw)return;var p=JSON.parse(raw);if(p&&p.policyVersion===${JSON.stringify(COOKIE_POLICY_VERSION)}){document.documentElement.setAttribute("data-cookie-consent","granted");}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-body-base bg-background text-on-background antialiased min-h-screen flex flex-col">
        <ResponsiveToaster />
        <OrganizationSchema />
        <SessionProvider initialSession={session}>
          {children}
        </SessionProvider>
        <CookieConsentRoot />
      </body>
    </html>
  );
}
