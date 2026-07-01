import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { CookieConsentRoot } from "@/components/shared/cookie-consent";
import { UxProvidersWithSync } from "@/components/shared/UxProvidersWithSync";
import { UxPreferenceBootstrap } from "@/components/shared/UxPreferenceBootstrap";
import {
  buildUxBlockingScript,
} from "@/lib/cookies/blocking-script";
import { getUxCookies } from "@/lib/cookies/server";
import { resolveThemeClass } from "@/lib/cookies/theme";

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

export const metadata: Metadata = {
  title: "Replace Me - Hire Top Filipino Remote Talent",
  description: "Connect directly with top-tier Filipino talent or find your dream remote role. Skip the agency fees and middlemen. Scale your business faster.",
  icons: {
    icon: "/images/logo_favicon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ux = await getUxCookies();
  const themeClass = ux.hasConsent ? resolveThemeClass(ux.theme, false) : "";
  const fontClasses = `${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable}`;

  return (
    <html
      lang="en"
      className={`${fontClasses}${themeClass ? ` ${themeClass}` : ""}`}
      suppressHydrationWarning
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: buildUxBlockingScript(),
          }}
        />
      </head>
      <body className="font-body-base bg-background text-on-background antialiased min-h-screen flex flex-col">
        <UxProvidersWithSync initialTheme={ux.theme}>
          <Toaster
            position="top-right"
            richColors
            offset={{ top: "calc(12px + env(safe-area-inset-top))", right: 12 }}
            mobileOffset={{ top: "calc(12px + env(safe-area-inset-top))", right: 12, left: 12 }}
            toastOptions={{ className: "max-w-[calc(100vw-24px)]" }}
          />
          {children}
          <UxPreferenceBootstrap />
          <CookieConsentRoot />
        </UxProvidersWithSync>
      </body>
    </html>
  );
}
