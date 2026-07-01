import { ReactNode } from "react";

interface MessagingCenterShellProps {
  children: ReactNode;
}

/** Centered, bounded messaging container — no global header/footer. */
export function MessagingCenterShell({ children }: MessagingCenterShellProps) {
  return (
    <div className="w-full">
      <div className="flex h-[calc(100dvh-8rem)] min-h-[480px] w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:h-[calc(100dvh-7.5rem)] lg:h-[calc(100dvh-6rem)] lg:min-h-[640px]">
        {children}
      </div>
    </div>
  );
}
