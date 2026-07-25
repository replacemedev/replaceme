import { ReactNode } from "react";

interface MessagingCenterShellProps {
  children: ReactNode;
}

/** Centered, bounded messaging container — no global header/footer. */
export function MessagingCenterShell({ children }: MessagingCenterShellProps) {
  return (
    <div className="w-full h-full min-h-0 flex items-stretch justify-center">
      <div className="flex h-full min-h-0 max-h-[calc(100dvh-8rem)] w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:max-h-[calc(100dvh-7.5rem)] lg:max-h-[calc(100dvh-6rem)]">
        {children}
      </div>
    </div>
  );
}
