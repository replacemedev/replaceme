import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { NavBrand } from "@/components/shared/nav/NavBrand";
import {
  AUTH_CARD,
  AUTH_FORM_MAX,
  AUTH_MARKETING_DESKTOP,
  AUTH_MARKETING_LEFT,
  AUTH_MARKETING_RIGHT,
  AUTH_PANEL_PADDING,
} from "@/lib/auth/ui-tokens";

interface AuthPageShellProps {
  children: ReactNode;
  marketing?: ReactNode;
  marketingPosition?: "left" | "right";
  footer?: ReactNode;
  brandHref?: string;
  centered?: boolean;
}

export function AuthPageShell({
  children,
  marketing,
  marketingPosition = "left",
  footer,
  brandHref = "/",
  centered = false,
}: AuthPageShellProps) {
  if (centered) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50/background px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-start">
            <NavBrand homeHref={brandHref} compact />
          </div>
          {children}
          {footer}
        </div>
      </main>
    );
  }

  const marketingPanel = (
    <div className={`hidden lg:flex lg:w-1/2 ${AUTH_MARKETING_DESKTOP}`}>
      {marketing}
    </div>
  );

  return (
    <main className="flex min-h-screen w-full flex-col bg-[#f8fafe] lg:flex-row">
      {marketingPosition === "left" ? marketingPanel : null}

      <div
        className={`flex w-full flex-1 flex-col justify-between min-h-screen lg:w-1/2 ${AUTH_PANEL_PADDING}`}
      >
        <div
          className={`flex flex-1 flex-col justify-center w-full ${AUTH_FORM_MAX} mx-auto py-6 sm:py-8`}
        >
          <div className="mb-6">
            <NavBrand homeHref={brandHref} compact />
          </div>
          {children}
        </div>
        {footer}
      </div>

      {marketingPosition === "right" ? marketingPanel : null}
    </main>
  );
}

export function AuthFormCard({ children }: { children: ReactNode }) {
  return <div className={AUTH_CARD}>{children}</div>;
}
