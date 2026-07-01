import { ReactNode } from "react";

interface MessagingCenterShellProps {
  children: ReactNode;
}

/** Centered, bounded messaging container — no global header/footer. */
export function MessagingCenterShell({ children }: MessagingCenterShellProps) {
  return (
    <div className="w-full">
      <div className="flex h-[calc(100vh-100px)] min-h-[480px] w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:h-[calc(100vh-112px)] lg:min-h-[640px]">
        {children}
      </div>
    </div>
  );
}
