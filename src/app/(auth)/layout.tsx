import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen pb-[env(safe-area-inset-bottom)]">{children}</div>
  );
}
