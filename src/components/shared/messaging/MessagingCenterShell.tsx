import { ReactNode } from "react";

interface MessagingCenterShellProps {
  children: ReactNode;
}

/** Centered, bounded messaging container — no global header/footer. */
export function MessagingCenterShell({ children }: MessagingCenterShellProps) {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="flex max-w-7xl mx-auto my-8 h-[75vh] min-h-[600px] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
