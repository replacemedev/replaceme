import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { CookieConsentRoot } from "@/components/shared/cookie-consent";
import { COOKIE_CONSENT_STORAGE_KEY } from "@/lib/cookie-consent/types";
import { COOKIE_POLICY_VERSION } from "@/lib/content/page-fallbacks";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <Toaster
          position="top-right"
          richColors
          closeButton
          offset={{ top: "calc(16px + env(safe-area-inset-top))", right: 16 }}
          mobileOffset={{ top: "calc(16px + env(safe-area-inset-top))", right: 16, left: 16, bottom: 16 }}
          toastOptions={{
            className: "mx-auto w-[calc(100vw-2rem)] max-w-sm sm:max-w-md",
          }}
        />
        {children}
        <CookieConsentRoot />
      </body>
    </html>
  );
}
