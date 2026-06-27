import type { ReactNode } from "react";
import {
  EMPLOYER_SHELL_PADDING,
  EMPLOYER_SHELL_WIDTH,
} from "@/lib/employer/ui-tokens";

export type EmployerPageWidth = keyof typeof EMPLOYER_SHELL_WIDTH;

interface EmployerPageShellProps {
  children: ReactNode;
  width?: EmployerPageWidth;
  className?: string;
}

export function EmployerPageShell({
  children,
  width = "default",
  className = "",
}: EmployerPageShellProps) {
  return (
    <div
      className={`mx-auto w-full ${EMPLOYER_SHELL_PADDING} ${EMPLOYER_SHELL_WIDTH[width]} flex flex-col gap-6 ${className}`}
    >
      {children}
    </div>
  );
}
