import React from "react";
import { WorkerHeader } from "@/components/layout/WorkerHeader";
import { Footer } from "@/components/layout/Footer";
import { AuthFlashToast } from "@/components/auth/AuthFlashToast";
import { WorkerLayoutChrome } from "@/components/worker/layout/WorkerLayoutChrome";
import { getNavSession } from "@/lib/auth/nav-session";

export const dynamic = "force-dynamic";

export default async function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getNavSession();

  return (
    <>
      <AuthFlashToast />
      <WorkerHeader session={session} />
      <main className="pt-0 min-h-screen bg-shell pb-[calc(56px+env(safe-area-inset-bottom))] lg:pb-0">
        {children}
      </main>
      <WorkerLayoutChrome unreadMessageCount={session.unreadMessageCount} />
      <div className="hidden lg:block">
        <Footer />
      </div>
    </>
  );
}
