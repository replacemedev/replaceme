import type { ReactNode } from "react";
import { NavBrand } from "@/components/shared/nav/NavBrand";
import {
  AUTH_CARD,
  AUTH_FORM_MAX,
  AUTH_MARKETING_DESKTOP,
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
      <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-background p-4 py-12 sm:p-8 lg:px-8">
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
    <main className="flex min-h-[100dvh] w-full flex-col bg-[#f8fafe] lg:flex-row">
      {marketingPosition === "left" ? marketingPanel : null}

      <div
        className={`flex w-full flex-1 flex-col justify-center min-h-[100dvh] lg:w-1/2 ${AUTH_PANEL_PADDING}`}
      >
        <div
          className={`flex w-full flex-1 flex-col justify-center ${AUTH_FORM_MAX} mx-auto py-6 sm:py-8`}
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
