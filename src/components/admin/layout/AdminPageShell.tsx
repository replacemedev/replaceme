import type { ReactNode } from "react";
import {
  ADMIN_SHELL_PADDING,
  ADMIN_SHELL_WIDTH,
} from "@/lib/admin/ui-tokens";

export type AdminPageWidth = keyof typeof ADMIN_SHELL_WIDTH;

interface AdminPageShellProps {
  children: ReactNode;
  width?: AdminPageWidth;
  className?: string;
}

export function AdminPageShell({
  children,
  width = "default",
  className = "",
}: AdminPageShellProps) {
  return (
    <div
      className={`mx-auto w-full ${ADMIN_SHELL_PADDING} ${ADMIN_SHELL_WIDTH[width]} flex flex-col gap-6 ${className}`}
    >
      {children}
    </div>
  );
}
