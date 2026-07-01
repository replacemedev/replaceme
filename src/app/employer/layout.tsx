import React from "react";
import { EmployerHeader } from "@/components/employer/layout/EmployerHeader";
import { EmployerLayoutChrome } from "@/components/employer/layout/EmployerLayoutChrome";
import { Footer } from "@/components/layout/Footer";
import { AuthFlashToast } from "@/components/auth/AuthFlashToast";
import { getNavSession } from "@/lib/auth/nav-session";

export const dynamic = "force-dynamic";

export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getNavSession();

  return (
    <>
      <AuthFlashToast />
      <EmployerHeader session={session} />
      <main className="pt-0 min-h-screen bg-shell pb-[calc(56px+env(safe-area-inset-bottom))] lg:pb-0">
        {children}
      </main>
      <EmployerLayoutChrome unreadMessageCount={session.unreadMessageCount} />
      <div className="hidden lg:block">
        <Footer />
      </div>
    </>
  );
}
