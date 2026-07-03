import { ReactNode } from "react";

interface MessagingCenterShellProps {
  children: ReactNode;
}

/** Centered, bounded messaging container — no global header/footer. */
export function MessagingCenterShell({ children }: MessagingCenterShellProps) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex h-full max-h-[calc(100dvh-8rem)] min-h-[480px] w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:max-h-[calc(100dvh-7.5rem)] lg:max-h-[calc(100dvh-6rem)] lg:min-h-[640px]">
        {children}
      </div>
    </div>
  );
}
