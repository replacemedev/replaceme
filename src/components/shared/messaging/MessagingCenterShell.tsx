import { ReactNode } from "react";

interface MessagingCenterShellProps {
  children: ReactNode;
}

/** Centered, bounded messaging container — no global header/footer. */
export function MessagingCenterShell({ children }: MessagingCenterShellProps) {
  return (
    <div className="w-full">
      <div className="flex w-full h-[70vh] min-h-[560px] bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
