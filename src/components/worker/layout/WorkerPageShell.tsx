import type { ReactNode } from "react";
import {
  WORKER_SHELL_PADDING,
  WORKER_SHELL_WIDTH,
} from "@/lib/worker/ui-tokens";

export type WorkerPageWidth = keyof typeof WORKER_SHELL_WIDTH;

interface WorkerPageShellProps {
  children: ReactNode;
  width?: WorkerPageWidth;
  className?: string;
}

export function WorkerPageShell({
  children,
  width = "default",
  className = "",
}: WorkerPageShellProps) {
  return (
    <div
      className={`mx-auto w-full ${WORKER_SHELL_PADDING} ${WORKER_SHELL_WIDTH[width]} flex flex-col gap-6 ${className}`}
    >
      {children}
    </div>
  );
}
